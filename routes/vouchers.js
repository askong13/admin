const express = require('express');
const router = express.Router();
const voucherController = require('../controllers/voucherController');
const { verifyToken } = require('../middleware/authMiddleware');

router.use(verifyToken);

router.get('/', voucherController.getAllVouchers);
router.post('/', voucherController.addVoucher);
router.put('/:id', voucherController.updateVoucher);
router.delete('/:id', voucherController.deleteVoucher);

module.exports = router;