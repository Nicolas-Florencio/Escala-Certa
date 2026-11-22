import { useState } from "react";
import { ArrowLeft, Mail, Lock, KeyRound, CircleAlert } from "lucide-react";
import LoginVisual from "./LoginVisual";

export default function RecuperarSenha({ onRedefinir, onVoltar }) {
  const [email, setEmail] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [erro, setErro] = useState("");

  function enviar(e) {
    e.preventDefault();

    if (novaSenha.length < 6) {
      setErro("A nova senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    if (novaSenha !== confirmar) {
      setErro("As senhas digitadas não coincidem.");
      return;
    }

    // onRedefinir devolve true se o e-mail existir e a senha for trocada
    const sucesso = onRedefinir(email, novaSenha);
    if (!sucesso) {
      setErro("Redefinição de senha ainda não está disponível. Peça ao gestor para recadastrar sua senha.");
    }
  }

  return (
    <div className="login-wrap">
      <LoginVisual />

      <div className="login-form-panel">
        <div className="login-box">
          <button type="button" className="btn btn-sm" onClick={onVoltar} style={{ marginBottom: 18 }}>
            <ArrowLeft size={14} />
            Voltar para o login
          </button>

          <h1>Redefinir senha</h1>
          <p className="sub">Informe seu e-mail cadastrado e defina uma nova senha.</p>

          {erro && (
            <div className="banner banner-error">
              <CircleAlert size={16} />
              <div>{erro}</div>
            </div>
          )}

          <div className="login-card">
            <form onSubmit={enviar}>
              <label>E-mail cadastrado</label>
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

              <label>Nova senha</label>
              <div className="input-icon-wrap">
                <Lock size={16} />
                <input
                  type="password"
                  placeholder="Mínimo de 6 caracteres"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  required
                />
              </div>

              <label>Confirmar nova senha</label>
              <div className="input-icon-wrap">
                <Lock size={16} />
                <input
                  type="password"
                  placeholder="Repita a nova senha"
                  value={confirmar}
                  onChange={(e) => setConfirmar(e.target.value)}
                  required
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  <KeyRound size={16} />
                  Salvar nova senha
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}