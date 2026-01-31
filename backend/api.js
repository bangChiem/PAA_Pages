import express from "express";
import cors from "cors";
import crypto from "crypto";
import dotenv from "dotenv";
import dbModule from "./db.js";

// db.js uses CommonJS exports; the default import contains the exported functions
const { createDb, createPost, getAllPosts, getPostById, updatePost, deletePost, closeDb } = dbModule;

dotenv.config({ path: "../.env" });

const app = express();
app.use(cors());
app.use(express.json());
const ADMIN_USER = process.env.ADMIN_USER;
const ADMIN_PASS = process.env.ADMIN_PASS;
const API_KEY = process.env.API_KEY;
console.log(ADMIN_USER, ADMIN_PASS, API_KEY);
const activeTokens = new Set();
const db = createDb("./posts.db");
app.set("db", db);

// --- CRUD endpoints for posts ---

// Read all posts
app.get("/posts", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limitQuery = parseInt(req.query.limit, 10);
    const DEFAULT_LIMIT = 10;
    const MAX_LIMIT = 100;
    const limit = Number.isInteger(limitQuery) && limitQuery > 0 ? Math.min(limitQuery, MAX_LIMIT) : DEFAULT_LIMIT;
    const offset = (page - 1) * limit;

    const rows = await getAllPosts(db, limit, offset);
    res.json({ ok: true, posts: rows, page, limit });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: "Failed to fetch posts" });
  }
});

// Read single post
app.get("/posts/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const row = await getPostById(db, id);
    if (!row) return res.status(404).json({ ok: false, error: "Post not found" });
    res.json({ ok: true, post: row });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: "Failed to fetch post" });
  }
});

// Create post
app.post("/posts", requireAdmin, async (req, res) => {
  try {
    const { username, caption, thumbnail, url } = req.body ?? {};
    if (!username || !caption || !thumbnail || !url) {
      return res.status(400).json({ ok: false, error: "Missing required fields" });
    }
    const id = await createPost(db, username, caption, thumbnail, url);
    res.status(201).json({ ok: true, id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: "Failed to create post" });
  }
});

// Update post
app.put("/posts/:id", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { username, caption, thumbnail, url } = req.body ?? {};
    const changes = await updatePost(db, id, username, caption, thumbnail, url);
    if (changes === 0) return res.status(404).json({ ok: false, error: "Post not found" });
    res.json({ ok: true, changed: changes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: "Failed to update post" });
  }
});

// Delete post
app.delete("/posts/:id", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const changes = await deletePost(db, id);
    if (changes === 0) return res.status(404).json({ ok: false, error: "Post not found" });
    res.json({ ok: true, deleted: changes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: "Failed to delete post" });
  }
});

app.get("/health", (req, res) => {
  res.status(200).json({ ok: true, status: "running" });
});

app.post("/auth/login", (req, res) => {
  const { email, password } = req.body ?? {};

  if (email !== ADMIN_USER || password !== ADMIN_PASS) {
    return res.status(401).json({ ok: false, error: "Invalid credentials" });
  }

  const token = crypto.randomBytes(32).toString("hex");
  activeTokens.add(token);

  return res.json({ ok: true, token });
});

function requireAdmin(req, res, next) {
  // Check API key first (header `x-api-key` or query `api_key`)
  const apiKey = req.headers["api_key"] || req.query.api_key;
  console.log("recieved: ", apiKey);
  if (apiKey === API_KEY) {
    return next();
  }

  // Fallback to Bearer token
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