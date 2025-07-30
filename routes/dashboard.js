const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { verifyToken } = require('../middleware/authMiddleware');

// Endpoint: GET /api/admin/dashboard/overview
// Deskripsi: Mendapatkan semua data ringkasan untuk dashboard.
// Middleware 'verifyToken' memastikan hanya admin yang terotentikasi yang bisa mengakses.
router.get('/overview', verifyToken, dashboardController.getDashboardOverview);

module.exports = router;