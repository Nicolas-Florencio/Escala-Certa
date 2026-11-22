import app from "./app.js";
import { config } from "./config.js";

app.listen(config.port, () => {
  console.log(`EscalaCerta API rodando em http://localhost:${config.port}`);
});
