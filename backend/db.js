const mongoose = require('mongoose');
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 15000,
      maxPoolSize: 50,        // max 50 connections per worker
      minPoolSize: 5,         // keep 5 warm connections ready
      socketTimeoutMS: 45000, // drop idle sockets after 45s
      compressors: 'zlib',    // compress data over the wire
    });
    console.log('✅ MongoDB Atlas connected');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
