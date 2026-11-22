// Camada de acesso à API do EscalaCerta (back-end Node/Express).
// Centraliza a URL base, o envio do token JWT e o tratamento de erros,
// para as telas não precisarem lidar com fetch/JSON diretamente.

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

async function request(path, { method = "GET", token, body, params } = {}) {
  const url = new URL(BASE_URL + path);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, v);
    });
  }

  let res;
  try {
    res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, "Não foi possível conectar ao servidor. Verifique se a API está no ar.");
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(res.status, data?.erro || "Ocorreu um erro inesperado.");
  }
  return data;
}

export const api = {
  auth: {
    login: (email, senha) => request("/auth/login", { method: "POST", body: { email, senha } }),
  },
  colaboradores: {
    listar: (token) => request("/colaboradores", { token }),
    criar: (dados, token) => request("/colaboradores", { method: "POST", body: dados, token }),
  },
  escalas: {
    // Lista a escala da equipe inteira (o próprio back-end não restringe por perfil);
    // usamos o mesmo endpoint para gestor e colaborador e filtramos na tela quando necessário.
    listar: (token, params) => request("/escalas", { token, params }),
    criar: (dados, token) => request("/escalas", { method: "POST", body: dados, token }),
  },
  trocas: {
    listar: (token, params) => request("/trocas", { token, params }),
    solicitar: (dados, token) => request("/trocas", { method: "POST", body: dados, token }),
    decidir: (id, status, token) =>
      request(`/trocas/${id}/status`, { method: "PATCH", body: { status }, token }),
  },
  folgas: {
    listar: (token, params) => request("/folgas", { token, params }),
    solicitar: (dados, token) => request("/folgas", { method: "POST", body: dados, token }),
    decidir: (id, status, token) =>
      request(`/folgas/${id}/status`, { method: "PATCH", body: { status }, token }),
  },
};

export { ApiError };
