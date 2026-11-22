import { useState } from "react";
import { Mail, Lock, CircleCheckBig, CircleAlert } from "lucide-react";
import LoginVisual from "./LoginVisual";

export default function Login({ loginState, onLogin, onEsqueciSenha }) {
  const [email, setEmail] = useState(loginState.email || "");
  const [senha, setSenha] = useState("");

  function enviar(e) {
    e.preventDefault();
    onLogin(email.trim().toLowerCase(), senha);
  }

  return (
    <div className="login-wrap">
      <LoginVisual />

      {/* Painel do formulário */}
      <div className="login-form-panel">
        <div className="login-box">
          <h1>Entrar</h1>
          <p className="sub">Entre com suas credenciais para acessar o sistema.</p>

          {loginState.error && (
            <div className="banner banner-error">
              <CircleAlert size={16} />
              <div>
                <b>Não foi possível entrar.</b> {loginState.mensagem || "E-mail ou senha incorretos."}
              </div>
            </div>
          )}
          {loginState.success && (
            <div className="banner banner-ok">
              <CircleCheckBig size={16} />
              <div>
                <b>Login realizado com sucesso!</b> Redirecionando para o dashboard…
              </div>
            </div>
          )}
          {loginState.senhaAlterada && (
            <div className="banner banner-ok">
              <CircleCheckBig size={16} />
              <div>
                <b>Senha alterada com sucesso!</b> Faça login com a sua nova senha.
              </div>
            </div>
          )}

          <div className="login-card">
            <form onSubmit={enviar}>
              <label>E-mail</label>
              <div className="input-icon-wrap">
                <Mail size={16} />
                <input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <label>Senha</label>
              <div className="input-icon-wrap">
                <Lock size={16} />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Entrar
                </button>
              </div>
            </form>
            <div className="login-foot">
              <a href="#" onClick={(e) => { e.preventDefault(); onEsqueciSenha(email); }}>
                Esqueci minha senha
              </a>
            </div>
          </div>

          <div className="demo-box">
            <b>Acesso de demonstração</b>
            Gestor: gestor@plantoes.com · senha 123456
            <br />
            Colaborador: emanuel@plantoes.com · senha 123456
            <div className="demo-actions">
              <button className="btn btn-sm" onClick={() => onLogin("gestor@plantoes.com", "123456")}>
                Entrar como Gestor
              </button>
              <button className="btn btn-sm" onClick={() => onLogin("emanuel@plantoes.com", "123456")}>
                Entrar como Emanuel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}