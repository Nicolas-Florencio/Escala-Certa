import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcryptjs";

// Configuração de teste: banco em memória, antes de importar o app
process.env.JWT_SECRET = "segredo-de-teste-com-mais-de-16-chars";
process.env.DB_PATH = ":memory:";
process.env.LOGIN_RATE_MAX = "1000";

let server, base, db;

async function api(method, path, { token, body } = {}) {
  const res = await fetch(base + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const json = await res.json().catch(() => null);
  return { status: res.status, body: json };
}

const login = async (email, senha = "123456") =>
  (await api("POST", "/api/auth/login", { body: { email, senha } })).body.token;

before(async () => {
  ({ db } = await import("../src/db.js"));
  const { default: app } = await import("../src/app.js");

  const hash = bcrypt.hashSync("123456", 4);
  const ins = db.prepare(
    "INSERT INTO colaboradores (nome, email, senha_hash, funcao, perfil) VALUES (?, ?, ?, ?, ?)"
  );
  ins.run("Gestor", "gestor@t.com", hash, "Gestor", "GESTOR"); // id 1
  ins.run("Ana", "ana@t.com", hash, "Enfermeira", "COLABORADOR"); // id 2
  ins.run("Bruno", "bruno@t.com", hash, "Enfermeiro", "COLABORADOR"); // id 3

  await new Promise((r) => (server = app.listen(0, r)));
  base = `http://localhost:${server.address().port}`;
});

after(() => server.close());

test("login: sucesso devolve token e usuário sem hash de senha", async () => {
  const r = await api("POST", "/api/auth/login", {
    body: { email: "ANA@t.com", senha: "123456" },
  });
  assert.equal(r.status, 200);
  assert.ok(r.body.token);
  assert.equal(r.body.usuario.perfil, "COLABORADOR");
  assert.equal(r.body.usuario.senha_hash, undefined);
});

test("login: senha errada, e-mail inexistente e corpo vazio", async () => {
  assert.equal((await api("POST", "/api/auth/login", { body: { email: "ana@t.com", senha: "x" } })).status, 401);
  assert.equal((await api("POST", "/api/auth/login", { body: { email: "nao@t.com", senha: "123456" } })).status, 401);
  assert.equal((await api("POST", "/api/auth/login", { body: {} })).status, 400);
});

test("rotas protegidas exigem token válido", async () => {
  assert.equal((await api("GET", "/api/escalas/me")).status, 401);
  assert.equal((await api("GET", "/api/escalas/me", { token: "lixo" })).status, 401);
});

test("colaboradores: só gestor cadastra; senha é gravada com hash; e-mail duplicado dá 409", async () => {
  const gestor = await login("gestor@t.com");
  const ana = await login("ana@t.com");
  const novo = { nome: "João", email: "joao@t.com", funcao: "Enfermeiro", senha: "segredo1" };

  assert.equal((await api("POST", "/api/colaboradores", { token: ana, body: novo })).status, 403);

  const r = await api("POST", "/api/colaboradores", { token: gestor, body: novo });
  assert.equal(r.status, 201);
  assert.ok(Number.isInteger(r.body.id));

  const linha = db.prepare("SELECT senha_hash FROM colaboradores WHERE id = ?").get(r.body.id);
  assert.notEqual(linha.senha_hash, "segredo1");
  assert.ok(await bcrypt.compare("segredo1", linha.senha_hash));

  assert.equal((await api("POST", "/api/colaboradores", { token: gestor, body: novo })).status, 409);
  assert.equal(
    (await api("POST", "/api/colaboradores", { token: gestor, body: { ...novo, email: "x", senha: "1" } })).status,
    400
  );
});

test("escalas: cria plantão, conflito de turno dá 409, valida entrada e permissão", async () => {
  const gestor = await login("gestor@t.com");
  const ana = await login("ana@t.com");
  const plantao = { colaborador_id: 2, data: "2026-09-10", turno: "Noturno" };

  assert.equal((await api("POST", "/api/escalas", { token: ana, body: plantao })).status, 403);

  const ok = await api("POST", "/api/escalas", { token: gestor, body: plantao });
  assert.equal(ok.status, 201);
  assert.equal(ok.body.colaborador_id, 2);

  assert.equal((await api("POST", "/api/escalas", { token: gestor, body: plantao })).status, 409);
  // turno diferente no mesmo dia não conflita
  assert.equal((await api("POST", "/api/escalas", { token: gestor, body: { ...plantao, turno: "Manhã" } })).status, 201);

  assert.equal((await api("POST", "/api/escalas", { token: gestor, body: { ...plantao, data: "2026-02-31" } })).status, 400);
  assert.equal((await api("POST", "/api/escalas", { token: gestor, body: { ...plantao, turno: "Madrugada" } })).status, 400);
  assert.equal((await api("POST", "/api/escalas", { token: gestor, body: { ...plantao, colaborador_id: 999 } })).status, 404);
});

test("escalas/me: devolve só os plantões e folgas do usuário logado", async () => {
  const ana = await login("ana@t.com");
  const bruno = await login("bruno@t.com");
  await api("POST", "/api/folgas", { token: ana, body: { data: "2026-09-15", motivo: "Assunto Pessoal" } });

  const r = await api("GET", "/api/escalas/me", { token: ana });
  assert.equal(r.status, 200);
  assert.equal(r.body.plantoes.length, 2);
  assert.equal(r.body.folgas.length, 1);

  const b = await api("GET", "/api/escalas/me", { token: bruno });
  assert.deepEqual(b.body, { plantoes: [], folgas: [] });

  const filtro = await api("GET", "/api/escalas/me?de=2026-09-11", { token: ana });
  assert.equal(filtro.body.plantoes.length, 0);
});

test("folgas: cria PENDENTE, bloqueia duplicada e valida data", async () => {
  const bruno = await login("bruno@t.com");
  const r = await api("POST", "/api/folgas", { token: bruno, body: { data: "2026-09-15", motivo: "Assunto Pessoal" } });
  assert.equal(r.status, 201);
  assert.equal(r.body.status, "PENDENTE");
  assert.equal((await api("POST", "/api/folgas", { token: bruno, body: { data: "2026-09-15" } })).status, 409);
  assert.equal((await api("POST", "/api/folgas", { token: bruno, body: { data: "15/09/2026" } })).status, 400);
});

test("folgas: gestor lista pendentes e aprova; colaborador é notificado", async () => {
  const gestor = await login("gestor@t.com");
  const bruno = await login("bruno@t.com");
  const lista = await api("GET", "/api/folgas?status=PENDENTE", { token: gestor });
  assert.equal(lista.status, 200);
  const deBruno = lista.body.find((f) => f.colaborador_nome === "Bruno");

  assert.equal((await api("PATCH", `/api/folgas/${deBruno.id}/status`, { token: bruno, body: { status: "APROVADO" } })).status, 403);
  const r = await api("PATCH", `/api/folgas/${deBruno.id}/status`, { token: gestor, body: { status: "APROVADO" } });
  assert.equal(r.body.status, "APROVADO");

  const notif = await api("GET", "/api/notificacoes", { token: bruno });
  assert.ok(notif.body.some((n) => n.tipo === "FOLGA_APROVADO"));
});

test("trocas: fluxo completo — solicita, notifica, gestor aprova e escala é reatribuída", async () => {
  const gestor = await login("gestor@t.com");
  const ana = await login("ana@t.com");
  const bruno = await login("bruno@t.com");
  const plantaoAna = db.prepare("SELECT id FROM plantoes WHERE colaborador_id = 2 AND turno = 'Noturno'").get().id;

  // regras de validação
  assert.equal((await api("POST", "/api/trocas", { token: bruno, body: { plantao_origem_id: plantaoAna, colaborador_destino_id: 2 } })).status, 403); // não é dele
  assert.equal((await api("POST", "/api/trocas", { token: ana, body: { plantao_origem_id: plantaoAna, colaborador_destino_id: 2 } })).status, 400); // com ela mesma
  assert.equal((await api("POST", "/api/trocas", { token: ana, body: { plantao_origem_id: 9999, colaborador_destino_id: 3 } })).status, 404);

  const r = await api("POST", "/api/trocas", { token: ana, body: { plantao_origem_id: plantaoAna, colaborador_destino_id: 3 } });
  assert.equal(r.status, 201);
  assert.equal(r.body.status, "PENDENTE");

  // pendente duplicada
  assert.equal((await api("POST", "/api/trocas", { token: ana, body: { plantao_origem_id: plantaoAna, colaborador_destino_id: 3 } })).status, 409);

  // colega recebeu notificação
  const notif = await api("GET", "/api/notificacoes?nao_lidas=true", { token: bruno });
  const n = notif.body.find((x) => x.tipo === "TROCA_SOLICITADA");
  assert.ok(n);
  assert.equal((await api("PATCH", `/api/notificacoes/${n.id}/lida`, { token: bruno })).status, 200);

  // só gestor decide; status inválido dá 400
  assert.equal((await api("PATCH", `/api/trocas/${r.body.id}/status`, { token: ana, body: { status: "APROVADO" } })).status, 403);
  assert.equal((await api("PATCH", `/api/trocas/${r.body.id}/status`, { token: gestor, body: { status: "TALVEZ" } })).status, 400);

  const ap = await api("PATCH", `/api/trocas/${r.body.id}/status`, { token: gestor, body: { status: "APROVADO" } });
  assert.equal(ap.status, 200);
  assert.equal(ap.body.troca.status, "APROVADO");
  assert.equal(ap.body.plantao.colaborador_id, 3);

  const doBruno = await api("GET", "/api/escalas/me", { token: bruno });
  assert.ok(doBruno.body.plantoes.some((p) => p.id === plantaoAna));

  // decidir de novo dá 409
  assert.equal((await api("PATCH", `/api/trocas/${r.body.id}/status`, { token: gestor, body: { status: "RECUSADO" } })).status, 409);
});

test("trocas: recusa não altera a escala; aprovação com conflito no destino dá 409 e reverte", async () => {
  const gestor = await login("gestor@t.com");
  const ana = await login("ana@t.com");

  // Ana tem Manhã em 2026-09-10 (criada antes); recusa mantém com ela
  const manha = db.prepare("SELECT id FROM plantoes WHERE colaborador_id = 2 AND turno = 'Manhã'").get().id;
  const t1 = await api("POST", "/api/trocas", { token: ana, body: { plantao_origem_id: manha, colaborador_destino_id: 3 } });
  const rec = await api("PATCH", `/api/trocas/${t1.body.id}/status`, { token: gestor, body: { status: "RECUSADO" } });
  assert.equal(rec.body.troca.status, "RECUSADO");
  assert.equal(db.prepare("SELECT colaborador_id c FROM plantoes WHERE id = ?").get(manha).c, 2);

  // Nova troca pendente; enquanto isso o gestor escala o destino no mesmo turno/dia
  const t2 = await api("POST", "/api/trocas", { token: ana, body: { plantao_origem_id: manha, colaborador_destino_id: 3 } });
  assert.equal(t2.status, 201);
  await api("POST", "/api/escalas", { token: gestor, body: { colaborador_id: 3, data: "2026-09-10", turno: "Manhã" } });

  const ap = await api("PATCH", `/api/trocas/${t2.body.id}/status`, { token: gestor, body: { status: "APROVADO" } });
  assert.equal(ap.status, 409);
  assert.equal(db.prepare("SELECT status s FROM trocas WHERE id = ?").get(t2.body.id).s, "PENDENTE"); // nada mudou
  assert.equal(db.prepare("SELECT colaborador_id c FROM plantoes WHERE id = ?").get(manha).c, 2);
});

test("404 em rota inexistente e 400 em JSON quebrado", async () => {
  assert.equal((await api("GET", "/api/nada")).status, 404);
  const res = await fetch(base + "/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{quebrado",
  });
  assert.equal(res.status, 400);
});

test("trocas: aceita plantão de qualquer dia da semana e qualquer turno (não só domingo)", async () => {
  const gestor = await login("gestor@t.com");
  const ana = await login("ana@t.com");
  // 2026-12-02 = quarta-feira, 2026-12-05 = sábado, 2026-12-08 = terça-feira
  for (const [data, turno] of [["2026-12-02", "Tarde"], ["2026-12-05", "Noturno"], ["2026-12-08", "Manhã"]]) {
    const p = await api("POST", "/api/escalas", { token: gestor, body: { colaborador_id: 2, data, turno } });
    assert.equal(p.status, 201);
    const t = await api("POST", "/api/trocas", {
      token: ana,
      body: { plantao_origem_id: p.body.id, colaborador_destino_id: 3, motivo: "teste" },
    });
    assert.equal(t.status, 201, `troca de ${data} deveria ser aceita`);
    assert.equal(t.body.status, "PENDENTE");
  }
});
