import "dotenv/config";

const env = process.env;

export const config = {
  port: Number(env.PORT) || 3000,
  jwtSecret: env.JWT_SECRET,
  jwtExpiresIn: env.JWT_EXPIRES_IN || "8h",
  dbPath: env.DB_PATH || "./data/escalacerta.db",
  corsOrigin: env.CORS_ORIGIN
    ? env.CORS_ORIGIN.split(",").map((s) => s.trim())
    : ["http://localhost:5173"],
  loginRateMax: Number(env.LOGIN_RATE_MAX) || 20,

  // Turnos aceitos em POST /api/escalas. Edite aqui se o seu domínio for outro.
  turnos: ["Manhã", "Tarde", "Noturno"],
};

if (!config.jwtSecret || config.jwtSecret.length < 16) {
  throw new Error(
    "JWT_SECRET não definido (ou muito curto). Copie .env.example para .env e defina um segredo com pelo menos 16 caracteres."
  );
}