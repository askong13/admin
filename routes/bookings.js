const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { verifyToken } = require('../middleware/authMiddleware');

// Amankan semua rute pemesanan dengan middleware verifikasi token
router.use(verifyToken);

// GET /api/admin/bookings/ -> Mendapatkan semua data pemesanan
router.get('/', bookingController.getAllBookings);

// POST /api/admin/bookings/ -> Menambah pemesanan baru
router.post('/', bookingController.addBooking);

// PUT /api/admin/bookings/:id/status -> Memperbarui status pemesanan
router.put('/:id/status', bookingController.updateBookingStatus);

// PUT /api/admin/bookings/:id -> Memperbarui detail pemesanan
router.put('/:id', bookingController.updateBookingDetails);

module.exports = router;