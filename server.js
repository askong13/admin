// =================================================================
// 1. IMPOR SEMUA MODUL DI BAGIAN ATAS
// =================================================================
const express = require('express');
const cors = require('cors');
const path = require('path'); // Modul 'path' hanya perlu diimpor sekali
require('dotenv').config();

// =================================================================
// 2. INISIALISASI APLIKASI (HANYA SEKALI)
// =================================================================
require('./config/firebase'); // Inisialisasi Firebase

const app = express(); // 'app' hanya dibuat sekali
const PORT = process.env.PORT || 3000;

// =================================================================
// 3. PENGATURAN MIDDLEWARE
// =================================================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware untuk logging setiap permintaan
app.use((req, res, next) => {
    console.log(`Incoming Request: ${req.method} ${req.path}`);
    next();
});

// Middleware untuk menyajikan file statis (HTML, CSS, JS) dari folder 'public'
app.use(express.static(path.join(__dirname, 'public')));

// =================================================================
// 4. DEFINISI RUTE API (BACKEND)
// =================================================================
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const locationRoutes = require('./routes/locations');
const bookingRoutes = require('./routes/bookings');
const userRoutes = require('./routes/users');
const messageRoutes = require('./routes/messages');
const faqRoutes = require('./routes/faqs');
const voucherRoutes = require('./routes/vouchers');
const settingsRoutes = require('./routes/settings');

const API_PREFIX = '/api/admin';

app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/dashboard`, dashboardRoutes);
app.use(`${API_PREFIX}/locations`, locationRoutes);
app.use(`${API_PREFIX}/bookings`, bookingRoutes);
app.use(`${API_PREFIX}/users`, userRoutes);
app.use(`${API_PREFIX}/messages`, messageRoutes);
app.use(`${API_PREFIX}/faqs`, faqRoutes);
app.use(`${API_PREFIX}/vouchers`, voucherRoutes);
app.use(`${API_PREFIX}/settings`, settingsRoutes);

// =================================================================
// 5. RUTE UNTUK MENYAJIKAN HALAMAN UTAMA (FRONTEND)
// PENTING: Ini harus diletakkan SETELAH semua rute API.
// =================================================================
app.get('*', (req, res) => {
  // Jika permintaan bukan ke API, kirim file index.html
  if (!req.path.startsWith(API_PREFIX)) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  } else {
    // Jika permintaan ke API yang tidak ada, kirim error 404
    res.status(404).send({ message: 'API endpoint not found' });
  }
});

// =================================================================
// 6. MENJALANKAN SERVER (HANYA SEKALI DI AKHIR FILE)
// =================================================================
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});