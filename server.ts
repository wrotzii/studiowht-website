import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-for-dev";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

// Initialize SQLite Database
const db = new Database("qr-database.sqlite");

// Set up tables
db.exec(`
  CREATE TABLE IF NOT EXISTS config (
    key TEXT PRIMARY KEY,
    value TEXT
  );
  CREATE TABLE IF NOT EXISTS favorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    label TEXT NOT NULL,
    url TEXT NOT NULL
  );
`);

// Helper to get active URL
const getActiveUrl = () => {
  const row = db.prepare("SELECT value FROM config WHERE key = 'active_url'").get() as { value: string } | undefined;
  return row ? row.value : null;
};

// Helper to set active URL
const setActiveUrl = (url: string) => {
  db.prepare("INSERT INTO config (key, value) VALUES ('active_url', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run(url);
};

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cookieParser());

// Simple Auth Middleware
const authenticateAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const token = req.cookies.admin_token;
  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).json({ error: "Unauthorized" });
  }
};

// API: Login
app.post("/api/admin/login", (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    const token = jwt.sign({ admin: true }, JWT_SECRET, { expiresIn: "1d" });
    res.cookie("admin_token", token, { httpOnly: true, path: "/" });
    res.json({ success: true });
  } else {
    res.status(401).json({ error: "Invalid password" });
  }
});

// API: Logout
app.post("/api/admin/logout", (req, res) => {
  res.clearCookie("admin_token");
  res.json({ success: true });
});

// API: Get Current QR State
app.get("/api/admin/qr", authenticateAdmin, (req, res) => {
  const activeUrl = getActiveUrl();
  const favorites = db.prepare("SELECT * FROM favorites ORDER BY label ASC").all();
  res.json({ activeUrl, favorites });
});

// API: Update Active URL
app.post("/api/admin/qr/active", authenticateAdmin, (req, res) => {
  const { url } = req.body;
  if (!url || !url.startsWith("http")) {
    res.status(400).json({ error: "Invalid URL. Must start with http or https." });
    return;
  }
  setActiveUrl(url);
  res.json({ success: true, url });
});

// API: Add Favorite
app.post("/api/admin/qr/favorites", authenticateAdmin, (req, res) => {
  const { label, url } = req.body;
  if (!label || !url || !url.startsWith("http")) {
    res.status(400).json({ error: "Invalid label or URL." });
    return;
  }
  const info = db.prepare("INSERT INTO favorites (label, url) VALUES (?, ?)").run(label, url);
  res.json({ success: true, id: info.lastInsertRowid, label, url });
});

// API: Edit Favorite
app.put("/api/admin/qr/favorites/:id", authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const { label, url } = req.body;
  if (!label || !url || !url.startsWith("http")) {
    res.status(400).json({ error: "Invalid label or URL." });
    return;
  }
  db.prepare("UPDATE favorites SET label = ?, url = ? WHERE id = ?").run(label, url, id);
  res.json({ success: true });
});

// API: Delete Favorite
app.delete("/api/admin/qr/favorites/:id", authenticateAdmin, (req, res) => {
  const { id } = req.params;
  db.prepare("DELETE FROM favorites WHERE id = ?").run(id);
  res.json({ success: true });
});

// The actual public redirect route
app.get("/qr", (req, res) => {
  const activeUrl = getActiveUrl();
  if (activeUrl) {
    res.redirect(302, activeUrl);
  } else {
    res.status(404).send("QR link is not configured yet.");
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
