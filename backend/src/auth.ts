import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const SECRET = "segredo_super_forte";
export const generateToken = (payload: object) => {
  return jwt.sign(payload, SECRET, { expiresIn: "1h" });
};

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token necessário" });

  try {
    const decoded = jwt.verify(token, SECRET);
    (req as any).user = decoded;
    next();
  } catch {
    res.status(403).json({ error: "Token inválido" });
  }
};
