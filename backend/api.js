import express from "express";
import cors from "cors";
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

app.listen(3000, () => {
  console.log("Server running on port 3000");
});