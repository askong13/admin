const express = require('express');
const router = express.Router();
const faqController = require('../controllers/faqController');
const { verifyToken } = require('../middleware/authMiddleware');

// Amankan semua rute FAQ
router.use(verifyToken);

router.get('/', faqController.getAllFaqs);
router.post('/', faqController.addFaq);
router.put('/:id', faqController.updateFaq);
router.delete('/:id', faqController.deleteFaq);

module.exports = router;