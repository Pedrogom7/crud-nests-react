import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "segredo_super_forte";

export const generateToken = (payload: object) => {
  return jwt.sign(payload, SECRET, { expiresIn: "1h" });
};

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = (req.headers.authorization || req.headers["Authorization"]) as string | undefined;
  const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
  if (!token) return res.status(401).json({ error: "Token necessário" });

  try {
    const decoded = jwt.verify(token, SECRET);
    (req as any).user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Token inválido" });
  }
};
