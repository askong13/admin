const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { verifyToken } = require('../middleware/authMiddleware');

router.use(verifyToken);

router.get('/', messageController.getAllMessages);
router.post('/send', messageController.sendMessage);
router.delete('/:id', messageController.deleteMessage);

module.exports = router;