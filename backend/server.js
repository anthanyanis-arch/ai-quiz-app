const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();

// ── Ensure uploads folder exists ─────────────────────────────────────────────
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

// ── Rate limiting (100 req/min per IP) ───────────────────────────────────────
const rateMap = new Map();
app.use((req, res, next) => {
  if (req.path === '/api/quiz/status') return next();

  const authRouteLimits = {
    '/api/auth/register': 30,
    '/api/auth/send-otp': 20,
    '/api/auth/login': 60,
    '/api/auth/admin-login': 20,
  };
  const limit = authRouteLimits[req.path] || 5000;
  const key = `${req.ip}:${req.path}`;
  const now = Date.now();
  const entry = rateMap.get(key) || { count: 0, start: now };
  if (now - entry.start > 60000) { entry.count = 0; entry.start = now; }
  entry.count++;
  rateMap.set(key, entry);
  if (entry.count > limit) return res.status(429).json({ message: 'Too many requests. Please slow down.' });
  next();
});

// ── Middleware ────────────────────────────────────────────────────────────────
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});
app.use(cors({ origin: '*', credentials: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Static: uploaded files ────────────────────────────────────────────────────
app.use('/uploads', express.static(uploadsDir));

// ── Static: vanilla frontend ──────────────────────────────────────────────────
const frontendDir = path.join(__dirname, '../frontend-vanilla');
app.use(express.static(frontendDir));

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api', require('./routes/index'));

// ── 404 handler for unknown API routes ───────────────────────────────────────
app.use('/api/*', (req, res) => res.status(404).json({ message: 'API route not found' }));

// ── Fallback: serve frontend for all other routes ────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendDir, 'index.html'));
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

// ── MongoDB + Start ───────────────────────────────────────────────────────────
const connectDB = require('./db');
connectDB().then(() => {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
});
