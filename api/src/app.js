import express from "express";
import cors from "cors";
import helmet from "helmet";
import { config } from "./config.js";
import { errorHandler, notFound } from "./utils/errors.js";

import authRoutes from "./routes/auth.js";
import colaboradoresRoutes from "./routes/colaboradores.js";
import escalasRoutes from "./routes/escalas.js";
import trocasRoutes from "./routes/trocas.js";
import folgasRoutes from "./routes/folgas.js";
import notificacoesRoutes from "./routes/notificacoes.js";

const app = express();

app.use(helmet());
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json({ limit: "100kb" }));

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/colaboradores", colaboradoresRoutes);
app.use("/api/escalas", escalasRoutes);
app.use("/api/trocas", trocasRoutes);
app.use("/api/folgas", folgasRoutes);
app.use("/api/notificacoes", notificacoesRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
