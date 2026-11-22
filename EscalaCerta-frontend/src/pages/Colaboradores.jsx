import { useState } from "react";
import { CircleAlert } from "lucide-react";

export default function Colaboradores({ db, onAdicionar }) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [funcao, setFuncao] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    setErro("");
    setEnviando(true);
    try {
      await onAdicionar({ nome: nome.trim(), email: email.trim(), funcao: funcao.trim(), senha });
      setNome("");
      setEmail("");
      setFuncao("");
      setSenha("");
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <div className="page-title">Colaboradores</div>
      <div className="page-sub">Equipe cadastrada no sistema de plantões.</div>

      <div className="card">
        <h3>Equipe</h3>
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Função</th>
              <th>Plantões atribuídos</th>
            </tr>
          </thead>
          <tbody>
            {db.colaboradores.map((c) => {
              const total = db.plantoes.filter((p) => p.colaborador_id === c.id).length;
              return (
                <tr key={c.id}>
                  <td>{c.nome}</td>
                  <td>{c.funcao}</td>
                  <td>{total}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h3>Adicionar colaborador</h3>
        {erro && (
          <div className="banner banner-error">
            <CircleAlert size={16} />
            <div>{erro}</div>
          </div>
        )}
        <form onSubmit={enviar} style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 160px" }}>
            <label style={{ marginTop: 0 }}>Nome</label>
            <input type="text" placeholder="Nome do colaborador" value={nome} onChange={(e) => setNome(e.target.value)} required />
          </div>
          <div style={{ flex: "1 1 200px" }}>
            <label style={{ marginTop: 0 }}>E-mail</label>
            <input type="email" placeholder="email@empresa.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div style={{ flex: "1 1 140px" }}>
            <label style={{ marginTop: 0 }}>Função</label>
            <input type="text" placeholder="Ex: Enfermeiro" value={funcao} onChange={(e) => setFuncao(e.target.value)} required />
          </div>
          <div style={{ flex: "1 1 140px" }}>
            <label style={{ marginTop: 0 }}>Senha</label>
            <input
              type="password"
              placeholder="Mínimo de 6 caracteres"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              minLength={6}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={enviando}>
            {enviando ? "Adicionando…" : "Adicionar"}
          </button>
        </form>
      </div>
    </>
  );
}
