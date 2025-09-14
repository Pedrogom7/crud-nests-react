import express from "express";
import cors from "cors";
import { initDB } from "./db";
import { routes } from "./routes";

const PORT = 5001;

(async () => {
  const app = express();
  app.use(cors());
  app.use(express.json());

  const db = await initDB();
  app.use("/", routes(db));

  app.listen(PORT, () => console.log(`🚀 Backend rodando em http://localhost:${PORT}`));
})();
