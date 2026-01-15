import express from "express";
import cors from "cors";
import crypto from "crypto";
import dotenv from "dotenv";
import { createDb } from "./db.js";

const app = express();
app.use(cors());
app.use(express.json());

const db = createDb("./posts.db");
app.set("db", db);

app.get("/health", (req, res) => {
  res.status(200).json({ ok: true, status: "running" });
});

app.get("/", (req, res) => {
  res.type("text").send("API is running");
});

app.post("/auth/login", (req, res) => {
  const { username, password } = req.body ?? {};

  if (username !== ADMIN_USER || password !== ADMIN_PASS) {
    return res.status(401).json({ ok: false, error: "Invalid credentials" });
  }

  const token = crypto.randomBytes(32).toString("hex");
  activeTokens.add(token);

  return res.json({ ok: true, token });
});

function requireAdmin(req, res, next) {
  const auth = req.headers.authorization || "";
  const [scheme, token] = auth.split(" ");

  if (scheme !== "Bearer" || !token || !activeTokens.has(token)) {
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }

  next();
}

// example protected route
app.get("/admin/me", requireAdmin, (req, res) => {
  res.json({ ok: true, user: ADMIN_USER });
});


app.listen(3000, () => {
  console.log("Server running on port 3000");
});