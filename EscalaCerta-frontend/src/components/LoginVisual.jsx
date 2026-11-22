import { CalendarDays, ArrowLeftRight, Coffee } from "lucide-react";

export default function LoginVisual() {
  return (
    <div className="login-visual">
      <div className="logo">
        <div className="logo-mark">
          <CalendarDays size={18} />
        </div>
        <div className="logo-text">EscalaCerta</div>
      </div>

      <div className="pitch">
        <h2>Organize os plantões da equipe sem planilha e sem confusão.</h2>
        <br></br>
        <div className="feature-list">
          <div className="item">
            <CalendarDays size={16} />
            Calendário com todos os plantões e folgas
          </div>
          <div className="item">
            <ArrowLeftRight size={16} />
            Troca de plantão com aprovação do gestor
          </div>
          <div className="item">
            <Coffee size={16} />
            Controle de folgas disponíveis por colaborador
          </div>
        </div>
      </div>

      <div className="foot-note">Projeto EscalaCerta - Gestão de escala e plantões.</div>
    </div>
  );
}