import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { authMiddleware, generateToken } from "./auth";
import { Database } from "sqlite";

export const routes = (db: Database) => {
  const router = Router();

  // Registro
  router.post("/register", async (req: Request, res: Response) => {
    const { name, email, password } = req.body;
    try {
      if (!name || !email || !password) {
        return res.status(400).json({ error: "Preencha todos os campos" });
      }

      const exists = await db.get("SELECT id FROM users WHERE email = ?", [email]);
      if (exists) return res.status(400).json({ error: "E-mail já registrado" });

      const hash = await bcrypt.hash(password, 10);
      const result = await db.run(
        "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
        [name, email, hash]
      );
      return res.status(201).json({ id: result.lastID, name, email });
    } catch (err: any) {
      console.error("POST /register error:", err);
      return res.status(500).json({ error: "Erro ao registrar usuário" });
    }
  });

  // Login
  router.post("/login", async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
      const user: any = await db.get("SELECT * FROM users WHERE email = ?", [email]);
      if (!user) return res.status(400).json({ error: "Usuário não encontrado" });

      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(400).json({ error: "Senha inválida" });

      const token = generateToken({ id: user.id, email: user.email });
      return res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
    } catch (err: any) {
      console.error("POST /login error:", err);
      return res.status(500).json({ error: "Erro ao realizar login" });
    }
  });

  // Listar usuários (protegido)
  router.get("/users", authMiddleware, async (_req: Request, res: Response) => {
    try {
      const users = await db.all("SELECT id, name, email FROM users");
      return res.json(users);
    } catch (err: any) {
      console.error("GET /users error:", err);
      return res.status(500).json({ error: "Erro ao buscar usuários" });
    }
  });

  // Atualizar usuário (protegido)
  router.put("/users/:id", authMiddleware, async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, email, password } = req.body;

    try {
      const existing: any = await db.get("SELECT * FROM users WHERE id = ?", [id]);
      if (!existing) return res.status(404).json({ error: "Usuário não encontrado" });

      let hash = existing.password;
      if (password) {
        hash = await bcrypt.hash(password, 10);
      }

      const newName = name ?? existing.name;
      const newEmail = email ?? existing.email;

      await db.run(
        "UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?",
        [newName, newEmail, hash, id]
      );

      console.log(`PUT /users/${id} — atualizado por ${(req as any).user?.email ?? "unknown"}`);
      const updated: any = await db.get("SELECT id, name, email FROM users WHERE id = ?", [id]);
      return res.json({ message: "Usuário atualizado com sucesso", user: updated });
    } catch (err: any) {
      console.error("PUT /users/:id error:", err);
      return res.status(500).json({ error: "Erro ao atualizar usuário" });
    }
  });

  // Deletar usuário (protegido)
  router.delete("/users/:id", authMiddleware, async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      const existing: any = await db.get("SELECT * FROM users WHERE id = ?", [id]);
      if (!existing) return res.status(404).json({ error: "Usuário não encontrado" });

      await db.run("DELETE FROM users WHERE id = ?", [id]);
      console.log(`DELETE /users/${id} — deletado por ${(req as any).user?.email ?? "unknown"}`);
      return res.json({ message: "Usuário deletado com sucesso", id });
    } catch (err: any) {
      console.error("DELETE /users/:id error:", err);
      return res.status(500).json({ error: "Erro ao deletar usuário" });
    }
  });

  return router;
};
