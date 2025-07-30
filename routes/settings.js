const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { verifyToken } = require('../middleware/authMiddleware');

router.use(verifyToken);

router.get('/', settingsController.getSettings);
router.post('/pricing', settingsController.updatePricing); // Menggunakan POST atau PUT
router.post('/footerLinks', settingsController.updateFooterLinks);

module.exports = router;