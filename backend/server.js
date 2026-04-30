const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const cluster = require('cluster');
const os = require('os');

// ── Cluster: use all CPU cores ────────────────────────────────────────────────
if (cluster.isMaster) {
  const cpus = os.cpus().length;
  console.log(`Master ${process.pid} running — forking ${cpus} workers`);
  for (let i = 0; i < cpus; i++) cluster.fork();
  cluster.on('exit', (worker) => {
    console.log(`Worker ${worker.process.pid} died — restarting`);
    cluster.fork();
  });
} else {

const app = express();

// ── Ensure uploads folder exists ─────────────────────────────────────────────
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

// ── Rate limiting (100 req/min per IP) ───────────────────────────────────────
const rateMap = new Map();
app.use((req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  const entry = rateMap.get(ip) || { count: 0, start: now };
  if (now - entry.start > 60000) { entry.count = 0; entry.start = now; }
  entry.count++;
  rateMap.set(ip, entry);
  if (entry.count > 100) return res.status(429).json({ message: 'Too many requests. Please slow down.' });
  next();
});

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
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
  app.listen(PORT, () => console.log(`Worker ${process.pid} running at http://localhost:${PORT}`));
});

} // end cluster worker
