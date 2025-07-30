const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');
const { verifyToken } = require('../middleware/authMiddleware');

// Terapkan middleware 'verifyToken' ke semua rute di file ini.
// Setiap permintaan ke /api/admin/locations/* akan dicek token-nya terlebih dahulu.
router.use(verifyToken);

// GET /api/admin/locations/ -> Mengambil semua lokasi
router.get('/', locationController.getAllLocations);

// POST /api/admin/locations/ -> Menambah lokasi baru
router.post('/', locationController.addLocation);

// PUT /api/admin/locations/:id -> Memperbarui lokasi dengan ID tertentu
router.put('/:id', locationController.updateLocation);

// DELETE /api/admin/locations/:id -> Menghapus lokasi dengan ID tertentu
router.delete('/:id', locationController.deleteLocation);

module.exports = router;