const admin = require('firebase-admin');
const path = require('path'); // Mengimpor modul 'path' dari Node.js
const fs = require('fs');     // Mengimpor modul 'fs' (File System)
require('dotenv').config();

try {
  // Membuat path absolut ke file kunci
  const keyFileName = 'serviceAccountKey.json';
  const absolutePath = path.join(__dirname, keyFileName);

  console.log(`Mencari file kunci di: ${absolutePath}`);

  // Cek apakah file benar-benar ada sebelum di-require
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`File tidak ditemukan di path: ${absolutePath}. Pastikan file 'serviceAccountKey.json' ada di dalam folder 'config'.`);
  }
  
  const serviceAccount = require(absolutePath);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL
  });

  console.log("Firebase Admin SDK initialized successfully.");

} catch (error) {
  console.error("Error initializing Firebase Admin SDK:", error.message);
  process.exit(1);
}

const db = admin.database();
const auth = admin.auth();

module.exports = { db, auth };