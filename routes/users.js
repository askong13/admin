const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/authMiddleware');

// Amankan semua rute pengguna
router.use(verifyToken);

// GET /api/admin/users/ -> Mendapatkan semua pengguna
router.get('/', userController.getAllUsers);

// GET /api/admin/users/:id -> Mendapatkan detail pengguna spesifik
router.get('/:id', userController.getUserDetails);

module.exports = router;