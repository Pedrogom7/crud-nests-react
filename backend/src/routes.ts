import { Router } from "express";
import bcrypt from "bcryptjs";
import { authMiddleware, generateToken } from "./auth";
import { Database } from "sqlite";

export const routes = (db: Database) => {
  const router = Router();

  // Registro
  router.post("/register", async (req, res) => {
    const { name, email, password } = req.body;
    try {
      const hash = await bcrypt.hash(password, 10);
      const result = await db.run(
        "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
        [name, email, hash]
      );
      res.json({ id: result.lastID, name, email });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Login
  router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const user = await db.get("SELECT * FROM users WHERE email = ?", [email]);
    if (!user) return res.status(400).json({ error: "Usuário não encontrado" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: "Senha inválida" });

    const token = generateToken({ id: user.id, email: user.email });
    res.json({ token });
  });

  // Rotas protegidas CRUD
  router.get("/users", authMiddleware, async (_, res) => {
    const users = await db.all("SELECT id, name, email FROM users");
    res.json(users);
  });

  router.put("/users/:id", authMiddleware, async (req, res) => {
    const { name, email } = req.body;
    const { id } = req.params;
    await db.run("UPDATE users SET name=?, email=? WHERE id=?", [name, email, id]);
    res.json({ updated: id });
  });

  router.delete("/users/:id", authMiddleware, async (req, res) => {
    const { id } = req.params;
    await db.run("DELETE FROM users WHERE id=?", id);
    res.json({ deleted: id });
  });

  return router;
};
