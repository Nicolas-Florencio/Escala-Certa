import {
  LayoutDashboard,
  CalendarDays,
  CalendarPlus,
  Users,
  ArrowLeftRight,
  Coffee,
  LogOut,
} from "lucide-react";

const ITENS_GESTOR = [
  ["dashboard", "Dashboard", LayoutDashboard],
  ["escala", "Gestão de escala", CalendarDays],
  ["criar-plantao", "Criar plantão", CalendarPlus],
  ["colaboradores", "Colaboradores", Users],
  ["solicitacoes", "Solicitações", ArrowLeftRight],
  ["folgas", "Folgas", Coffee],
];

const ITENS_COLABORADOR = [
  ["dashboard", "Dashboard", LayoutDashboard],
  ["escala", "Minha escala", CalendarDays],
  ["solicitacoes", "Solicitações", ArrowLeftRight],
  ["folgas", "Folgas", Coffee],
];

export default function Sidebar({ session, rota, navegar, sair }) {
  const isGestor = session.role === "gestor";
  const itens = isGestor ? ITENS_GESTOR : ITENS_COLABORADOR;
  const iniciais = session.nome.slice(0, 2).toUpperCase();

  return (
    <div className="sidebar">
      <div className="logo">
        <div className="logo-mark">
          <CalendarDays size={18} />
        </div>
        <div className="logo-text">EscalaCerta</div>
      </div>

      <nav>
        {itens.map(([r, label, Icone]) => (
          <button key={r} className={rota === r ? "active" : ""} onClick={() => navegar(r)}>
            <Icone size={17} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="foot">
        <div className="user-chip">
          <div className="avatar">{iniciais}</div>
          <div className="info">
            <span className="name">{session.nome}</span>
            <span className="role">{isGestor ? "Gestor" : "Colaborador"}</span>
          </div>
        </div>
        <button className="logout-btn" onClick={sair}>
          <LogOut size={16} />
          Sair
        </button>
      </div>
    </div>
  );
}