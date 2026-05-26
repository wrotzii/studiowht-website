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
  CREATE TABLE IF NOT EXISTS media (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    url TEXT NOT NULL,
    thumbnail TEXT,
    title TEXT,
    folder TEXT DEFAULT 'Uncategorized',
    tags TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    size INTEGER DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS revisions (
    id TEXT PRIMARY KEY,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    name TEXT
  );
  CREATE TABLE IF NOT EXISTS pages (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    status TEXT DEFAULT 'draft',
    is_home BOOLEAN DEFAULT 0,
    seo_title TEXT,
    seo_description TEXT,
    seo_image TEXT,
    content TEXT,
    draft_content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action TEXT NOT NULL,
    user TEXT,
    details TEXT,
    ip_address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS contact_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS page_views (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    path TEXT NOT NULL,
    user_agent TEXT,
    ip_address TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS qr_scans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    destination_url TEXT NOT NULL,
    user_agent TEXT,
    ip_address TEXT,
    referrer TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

try { db.prepare("ALTER TABLE contact_messages ADD COLUMN is_read INTEGER DEFAULT 0").run(); } catch(e) {}

// Seed default page if pages is empty
const pageCount = db.prepare("SELECT COUNT(*) AS count FROM pages").get() as { count: number };
if (pageCount.count === 0) {
  const defaultContent = db.prepare("SELECT value FROM config WHERE key = 'site_content'").get() as { value: string } | undefined;
  const contentToUse = defaultContent ? defaultContent.value : '{}';
  db.prepare(`
    INSERT INTO pages (id, slug, title, is_home, status, content, draft_content)
    VALUES ('home', '/', 'Home', 1, 'published', ?, ?)
  `).run(contentToUse, contentToUse);
}

import fs from 'fs';
import multer from 'multer';

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Map the /uploads URL to the uploads directory
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname.replace(/[^a-zA-Z0-9.]/g, ''));
  }
});
const upload = multer({ storage });


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
app.set('trust proxy', true);

app.use(express.json());
app.use(cookieParser());

// Activity Log Helper
const logActivity = (action: string, user: string, details: string, ip: string) => {
  try {
    db.prepare("INSERT INTO activity_logs (action, user, details, ip_address) VALUES (?, ?, ?, ?)").run(action, user, details, ip);
  } catch (err) {
    console.error("Failed to log activity:", err);
  }
};

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
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  if (password === ADMIN_PASSWORD) {
    const token = jwt.sign({ admin: true }, JWT_SECRET, { expiresIn: "1d" });
    res.cookie("admin_token", token, { httpOnly: true, path: "/" });
    logActivity('login_success', 'admin', 'Successful login', ip);
    res.json({ success: true });
  } else {
    logActivity('login_failed', 'unknown', 'Failed login attempt', ip);
    res.status(401).json({ error: "Invalid password" });
  }
});

// API: Logout
app.post("/api/admin/logout", (req, res) => {
  res.clearCookie("admin_token");
  res.json({ success: true });
});

// Simple memory store for basic rate limiting
const contactRateLimits = new Map<string, number>();

// API: Submit Contact Form
app.post("/api/contact", (req, res) => {
  const { name, email, message } = req.body;
  const ip = req.ip || req.connection.remoteAddress || 'unknown';

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Basic rate limiting: 1 message per 5 minutes per IP
  const lastTime = contactRateLimits.get(ip);
  const now = Date.now();
  if (lastTime && now - lastTime < 5 * 60 * 1000) {
    return res.status(429).json({ error: "Please wait before sending another message." });
  }
  contactRateLimits.set(ip, now);

  try {
    db.prepare("INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)").run(name, email, message);
    logActivity('contact_message', 'public', `Message from ${email}`, ip);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to save message" });
  }
});

// API: Admin get contact messages
app.get("/api/admin/messages", authenticateAdmin, (req, res) => {
  const messages = db.prepare("SELECT * FROM contact_messages ORDER BY created_at DESC").all();
  res.json(messages);
});

// API: Admin mark message as read
app.post("/api/admin/messages/:id/read", authenticateAdmin, (req, res) => {
  try {
    db.prepare("UPDATE contact_messages SET is_read = 1 WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update message" });
  }
});

// API: Admin delete message
app.delete("/api/admin/messages/:id", authenticateAdmin, (req, res) => {
  try {
    db.prepare("DELETE FROM contact_messages WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete message" });
  }
});

// API: Track Page Visit
app.post("/api/track-visit", (req, res) => {
  const { path } = req.body;
  if (!path) return res.status(400).json({ error: "Path needed" });
  
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const ua = req.headers['user-agent'] || 'unknown';
  
  try {
    db.prepare("INSERT INTO page_views (path, user_agent, ip_address) VALUES (?, ?, ?)").run(path, ua, ip);
    res.json({ success: true });
  } catch(err) {
    res.status(500).json({ error: "Failed to track" });
  }
});

// API: Get analytics data
app.get("/api/admin/analytics", authenticateAdmin, (req, res) => {
  try {
    const timeframe = req.query.timeframe as string || '30';
    let condition = '';
    
    if (timeframe === '30') condition = "timestamp >= datetime('now', '-30 days')";
    else if (timeframe === '60') condition = "timestamp >= datetime('now', '-60 days')";
    else if (timeframe === '90') condition = "timestamp >= datetime('now', '-90 days')";
    else if (timeframe === '365') condition = "timestamp >= datetime('now', '-1 year')";
    else if (timeframe === 'all') condition = "1=1";
    else condition = "timestamp >= datetime('now', '-30 days')";

    const trend = db.prepare(`
      SELECT date(timestamp) as date, count(*) as views
      FROM page_views
      WHERE ${condition}
      GROUP BY date(timestamp)
      ORDER BY date ASC
    `).all();

    const topPages = db.prepare(`
      SELECT path, count(*) as views
      FROM page_views
      WHERE ${condition}
      GROUP BY path
      ORDER BY views DESC
      LIMIT 10
    `).all();

    const totalViews = db.prepare(`SELECT count(*) as count FROM page_views WHERE ${condition}`).get();

    res.json({ trend, topPages, totalViews: (totalViews as any)?.count || 0 });
  } catch (err) {
    res.status(500).json({ error: "Failed to load analytics" });
  }
});

// API: Get Logs
app.get("/api/admin/logs", authenticateAdmin, (req, res) => {
  const logs = db.prepare("SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 100").all();
  res.json(logs);
});

// API: Get Site Content (Public) - Now returns page by slug
app.get("/api/content", (req, res) => {
  const slug = (req.query.slug as string) || '/';
  const settingsRow = db.prepare("SELECT value FROM config WHERE key = 'site_settings'").get() as { value: string } | undefined;
  const siteSettings = settingsRow ? JSON.parse(settingsRow.value) : {};

  const row = db.prepare("SELECT * FROM pages WHERE slug = ? AND status = 'published'").get(slug) as any;
  if (row) {
    res.json({
      content: JSON.parse(row.content || '{}'),
      seo: {
        title: row.seo_title,
        description: row.seo_description,
        image: row.seo_image
      },
      settings: siteSettings
    });
  } else {
    // If we're looking for home and it doesn't exist by slug, get the designated home page
    if (slug === '/') {
       const homeRow = db.prepare("SELECT * FROM pages WHERE is_home = 1 AND status = 'published'").get() as any;
       if (homeRow) {
         return res.json({
            content: JSON.parse(homeRow.content || '{}'),
            seo: {
              title: homeRow.seo_title,
              description: homeRow.seo_description,
              image: homeRow.seo_image
            },
            settings: siteSettings
          });
       }
    }
    
    // Fallback to legacy
    const legacy = db.prepare("SELECT value FROM config WHERE key = 'site_content'").get() as { value: string } | undefined;
    if (legacy) {
      res.json({ content: JSON.parse(legacy.value), settings: siteSettings });
    } else {
      res.json({ content: null, settings: siteSettings }); // Client can fallback to default JSON
    }
  }
});

// API: Admin list pages
app.get("/api/admin/pages", authenticateAdmin, (req, res) => {
  const pages = db.prepare("SELECT id, slug, title, status, is_home, created_at, updated_at FROM pages ORDER BY created_at DESC").all();
  res.json(pages);
});

// API: Global Settings
app.get("/api/settings", (req, res) => {
  const row = db.prepare("SELECT value FROM config WHERE key = 'site_settings'").get() as { value: string } | undefined;
  if (row) {
    res.json(JSON.parse(row.value));
  } else {
    res.json({});
  }
});

app.post("/api/admin/settings", authenticateAdmin, (req, res) => {
  const settings = req.body;
  if (!settings) return res.status(400).json({ error: "No settings provided." });
  
  try {
    db.prepare("INSERT INTO config (key, value) VALUES ('site_settings', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run(JSON.stringify(settings));
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to save settings." });
  }
});

// API: Admin create page
app.post("/api/admin/pages", authenticateAdmin, (req, res) => {
  const { title, slug } = req.body;
  if (!title || !slug) return res.status(400).json({ error: "Title and slug are required" });
  
  const id = Date.now().toString(36) + Math.random().toString(36).substr(2);
  try {
    db.prepare("INSERT INTO pages (id, title, slug) VALUES (?, ?, ?)").run(id, title, slug);
    const newPage = db.prepare("SELECT * FROM pages WHERE id = ?").get(id);
    res.json(newPage);
  } catch (err: any) {
    if (err.message.includes("UNIQUE constraint failed")) {
      return res.status(400).json({ error: "Slug must be unique" });
    }
    res.status(500).json({ error: "Database error" });
  }
});

// API: Admin get page draft
app.get("/api/admin/pages/:id/draft", authenticateAdmin, (req, res) => {
  const row = db.prepare("SELECT * FROM pages WHERE id = ?").get(req.params.id) as any;
  if (row) {
    const data = {
      content: row.draft_content ? JSON.parse(row.draft_content) : (row.content ? JSON.parse(row.content) : null),
      pageInfo: {
        id: row.id,
        title: row.title,
        slug: row.slug,
        status: row.status,
        is_home: row.is_home,
        seo_title: row.seo_title,
        seo_description: row.seo_description,
        seo_image: row.seo_image
      }
    };
    res.json(data);
  } else {
    res.status(404).json({ error: "Page not found" });
  }
});

// API: Save Draft Content (By Page)
app.post("/api/admin/pages/:id/draft", authenticateAdmin, (req, res) => {
  const { content, pageInfo } = req.body;
  if (!content) return res.status(400).json({ error: "No content provided." });
  
  try {
    db.prepare(`
      UPDATE pages SET 
        draft_content = ?, 
        title = COALESCE(?, title),
        slug = COALESCE(?, slug),
        seo_title = COALESCE(?, seo_title),
        seo_description = COALESCE(?, seo_description),
        seo_image = COALESCE(?, seo_image),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      JSON.stringify(content), 
      pageInfo?.title, pageInfo?.slug,
      pageInfo?.seo_title, pageInfo?.seo_description, pageInfo?.seo_image,
      req.params.id
    );
    res.json({ success: true });
  } catch (e: any) {
    if (e.message.includes("UNIQUE constraint failed")) {
      return res.status(400).json({ error: "Slug must be unique" });
    }
    res.status(500).json({ error: "Failed to save draft" });
  }
});

// API: Publish Site Content (By Page)
app.post("/api/admin/pages/:id/publish", authenticateAdmin, (req, res) => {
  const { content, name, pageInfo } = req.body;
  if (!content) return res.status(400).json({ error: "No content provided." });
  
  const contentStr = JSON.stringify(content);
  db.prepare(`
    UPDATE pages SET 
      content = ?, 
      draft_content = ?, 
      status = 'published',
      title = COALESCE(?, title),
      slug = COALESCE(?, slug),
      seo_title = COALESCE(?, seo_title),
      seo_description = COALESCE(?, seo_description),
      seo_image = COALESCE(?, seo_image),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    contentStr, contentStr,
    pageInfo?.title, pageInfo?.slug,
    pageInfo?.seo_title, pageInfo?.seo_description, pageInfo?.seo_image,
    req.params.id
  );
  
  // Legacy generic sync
  if (req.params.id === 'home' || pageInfo?.is_home) {
    db.prepare("INSERT INTO config (key, value) VALUES ('site_content', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run(contentStr);
    db.prepare("INSERT INTO config (key, value) VALUES ('draft_content', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run(contentStr);
  }
  
  // Create Revision
  const revId = Date.now().toString(36) + Math.random().toString(36).substr(2);
  db.prepare("INSERT INTO revisions (id, content, name) VALUES (?, ?, ?)").run(revId, contentStr, (name || 'Published Version') + ` (${pageInfo?.title || req.params.id})`);
  
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  logActivity('page_published', 'admin', `Published page: ${pageInfo?.title || req.params.id}`, ip);

  res.json({ success: true, revisionId: revId });
});

// API: Delete Page
app.delete("/api/admin/pages/:id", authenticateAdmin, (req, res) => {
  if (req.params.id === 'home') return res.status(400).json({ error: "Cannot delete the home page" });
  const row = db.prepare("SELECT is_home FROM pages WHERE id = ?").get(req.params.id) as any;
  if (row && row.is_home) return res.status(400).json({ error: "Cannot delete the designated home page" });
  
  db.prepare("DELETE FROM pages WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

// API: Duplicate Page
app.post("/api/admin/pages/:id/duplicate", authenticateAdmin, (req, res) => {
  const row = db.prepare("SELECT * FROM pages WHERE id = ?").get(req.params.id) as any;
  if (!row) return res.status(404).json({ error: "Page not found" });
  
  const id = Date.now().toString(36) + Math.random().toString(36).substr(2);
  const slug = row.slug + '-copy';
  const title = row.title + ' (Copy)';
  
  try {
    db.prepare(`
      INSERT INTO pages (id, slug, title, status, is_home, seo_title, seo_description, seo_image, content, draft_content)
      VALUES (?, ?, ?, 'draft', 0, ?, ?, ?, ?, ?)
    `).run(id, slug, title, row.seo_title, row.seo_description, row.seo_image, row.content, row.draft_content);
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to duplicate page" });
  }
});

// API: Set Home Page
app.post("/api/admin/pages/:id/set-home", authenticateAdmin, (req, res) => {
  db.prepare("BEGIN TRANSACTION").run();
  try {
    db.prepare("UPDATE pages SET is_home = 0").run();
    db.prepare("UPDATE pages SET is_home = 1 WHERE id = ?").run(req.params.id);
    db.prepare("COMMIT").run();
    res.json({ success: true });
  } catch(err) {
    db.prepare("ROLLBACK").run();
    res.status(500).json({ error: "Failed to set home page" });
  }
});

// API: Old Endpoints Retained for backwards compatibility temporarily
app.get("/api/admin/content/draft", authenticateAdmin, (req, res) => {
  // Let's redirect legacy draft request to home page
  const row = db.prepare("SELECT draft_content, content, id, title, slug, is_home FROM pages WHERE id = 'home' OR is_home = 1 LIMIT 1").get() as any;
  if (row) {
     res.json(row.draft_content ? JSON.parse(row.draft_content) : JSON.parse(row.content || '{}'));
  } else {
     res.json(null);
  }
});

// Deprecated
app.post("/api/admin/content/draft", authenticateAdmin, (req, res) => {
  res.json({ success: true });
});

// Deprecated
app.post("/api/admin/content/publish", authenticateAdmin, (req, res) => {
  res.json({ success: true });
});

// API: List Revisions
app.get("/api/admin/content/revisions", authenticateAdmin, (req, res) => {
  const revs = db.prepare("SELECT id, created_at, name FROM revisions ORDER BY created_at DESC").all();
  res.json(revs);
});

// API: Get Specific Revision
app.get("/api/admin/content/revisions/:id", authenticateAdmin, (req, res) => {
  const row = db.prepare("SELECT * FROM revisions WHERE id = ?").get(req.params.id) as { content: string } | undefined;
  if (row) {
    res.json(JSON.parse(row.content));
  } else {
    res.status(404).json({ error: "Revision not found." });
  }
});

// API: Update Site Content (Legacy - left for compatibility if used)
app.post("/api/admin/content", authenticateAdmin, (req, res) => {
  const { content } = req.body;
  db.prepare("INSERT INTO config (key, value) VALUES ('site_content', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run(JSON.stringify(content));
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

// Serve uploaded content
app.use("/uploads", express.static(uploadsDir));

// API: Get Media
app.get("/api/admin/media", authenticateAdmin, (req, res) => {
  const media = db.prepare("SELECT * FROM media ORDER BY created_at DESC").all();
  res.json(media);
});

// API: Upload Media
app.post("/api/admin/media/upload", authenticateAdmin, upload.single("file"), (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "No file uploaded." });
    return;
  }
  const id = Date.now().toString(36) + Math.random().toString(36).substr(2);
  const type = req.file.mimetype.startsWith("image/") ? "image" 
             : req.file.mimetype.startsWith("video/") ? "video" 
             : "document";
  const url = "/uploads/" + req.file.filename;
  
  db.prepare(`
    INSERT INTO media (id, type, url, thumbnail, title, size) 
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, type, url, url, req.file.originalname, req.file.size);
  
  const newItem = db.prepare("SELECT * FROM media WHERE id = ?").get(id);
  res.json(newItem);
});

// API: Add Embed Media
app.post("/api/admin/media/embed", authenticateAdmin, (req, res) => {
  const { type, url, thumbnail, title, folder, tags } = req.body;
  const id = Date.now().toString(36) + Math.random().toString(36).substr(2);
  
  db.prepare(`
    INSERT INTO media (id, type, url, thumbnail, title, folder, tags) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, type, url, thumbnail || url, title || "Embed", folder || "Uncategorized", tags || "");
  
  const newItem = db.prepare("SELECT * FROM media WHERE id = ?").get(id);
  res.json(newItem);
});

// API: Delete Media
app.delete("/api/admin/media/:id", authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const item = db.prepare("SELECT * FROM media WHERE id = ?").get(id) as any;
  if (item && item.url.startsWith("/uploads/")) {
    const filePath = path.join(process.cwd(), item.url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
  db.prepare("DELETE FROM media WHERE id = ?").run(id);
  res.json({ success: true });
});

// API: Update Media Metadata
app.put("/api/admin/media/:id", authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const { title, folder, tags } = req.body;
  db.prepare(`
    UPDATE media SET title = ?, folder = ?, tags = ? WHERE id = ?
  `).run(title, folder, tags, id);
  res.json({ success: true });
});

// The actual public redirect route
app.get("/qr", (req, res) => {
  const activeUrl = getActiveUrl();
  if (activeUrl) {
    // Track async
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const ua = req.headers['user-agent'] || 'unknown';
    const ref = req.get('Referrer') || req.get('Referer') || 'direct';
    try {
      db.prepare("INSERT INTO qr_scans (destination_url, user_agent, ip_address, referrer) VALUES (?, ?, ?, ?)").run(activeUrl, ua, ip, ref);
    } catch(err) {}
    
    res.redirect(302, activeUrl);
  } else {
    res.status(404).send("QR link is not configured yet.");
  }
});

// API: Get QR Analytics data
app.get("/api/admin/analytics/qr", authenticateAdmin, (req, res) => {
  try {
    const timeframe = req.query.timeframe as string || '30';
    let condition = '';
    
    if (timeframe === '30') condition = "timestamp >= datetime('now', '-30 days')";
    else if (timeframe === '60') condition = "timestamp >= datetime('now', '-60 days')";
    else if (timeframe === '90') condition = "timestamp >= datetime('now', '-90 days')";
    else if (timeframe === '365') condition = "timestamp >= datetime('now', '-1 year')";
    else if (timeframe === 'all') condition = "1=1";
    else condition = "timestamp >= datetime('now', '-30 days')";

    const trend = db.prepare(`
      SELECT date(timestamp) as date, count(*) as scans
      FROM qr_scans
      WHERE ${condition}
      GROUP BY date(timestamp)
      ORDER BY date ASC
    `).all();

    const topDestinations = db.prepare(`
      SELECT destination_url as url, count(*) as scans, max(timestamp) as last_scan
      FROM qr_scans
      WHERE ${condition}
      GROUP BY destination_url
      ORDER BY scans DESC
      LIMIT 20
    `).all();

    const recentScans = db.prepare(`
      SELECT destination_url as url, user_agent, ip_address, referrer, timestamp
      FROM qr_scans
      ORDER BY timestamp DESC
      LIMIT 100
    `).all();

    const totalScans = db.prepare(`SELECT count(*) as count FROM qr_scans WHERE ${condition}`).get();

    res.json({ trend, topDestinations, recentScans, totalScans: (totalScans as any)?.count || 0 });
  } catch (err) {
    res.status(500).json({ error: "Failed to load QR analytics" });
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
