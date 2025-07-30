const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Endpoint: POST /api/admin/auth/login
// Deskripsi: Untuk memverifikasi kredensial login admin.
router.post('/login', authController.adminLogin);

module.exports = router;