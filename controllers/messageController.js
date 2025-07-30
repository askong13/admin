const { db } = require('../config/firebase');

// Mendapatkan semua pesan
exports.getAllMessages = async (req, res) => {
    try {
        const snapshot = await db.ref('userMessages').orderByChild('createdAt').once('value');
        const messages = [];
        snapshot.forEach(child => {
            messages.push({ id: child.key, ...child.val() });
        });
        res.status(200).json(messages.reverse());
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).send({ message: 'Gagal mengambil data pesan', error: error.message });
    }
};

// Mengirim pesan ke pengguna (Broadcast/Personal)
exports.sendMessage = async (req, res) => {
    try {
        const { recipientIds, subject, content } = req.body; // recipientIds adalah array of user IDs
        if (!recipientIds || recipientIds.length === 0 || !content) {
            return res.status(400).send({ message: 'Penerima dan konten pesan harus diisi.' });
        }

        const adminUser = req.user; // Didapat dari middleware verifyToken
        const messagePromises = recipientIds.map(userId => {
            const newMessage = {
                recipientId: userId,
                senderId: adminUser.uid,
                senderName: 'Storapedia Admin',
                subject: subject || 'Pemberitahuan dari Storapedia',
                content,
                status: 'sent',
                createdAt: Date.now(),
            };
            return db.ref('userMessages').push(newMessage);
        });

        await Promise.all(messagePromises);
        res.status(200).send({ message: `Pesan berhasil dikirim ke ${recipientIds.length} pengguna.` });

    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).send({ message: 'Gagal mengirim pesan', error: error.message });
    }
};

// Menghapus pesan
exports.deleteMessage = async (req, res) => {
    try {
        const { id } = req.params;
        await db.ref(`userMessages/${id}`).remove();
        res.status(200).send({ message: 'Pesan berhasil dihapus' });
    } catch (error) {
        console.error("Error deleting message:", error);
        res.status(500).send({ message: 'Gagal menghapus pesan', error: error.message });
    }
};