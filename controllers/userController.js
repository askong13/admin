const { db } = require('../config/firebase');

// Mendapatkan semua pengguna
exports.getAllUsers = async (req, res) => {
    try {
        const snapshot = await db.ref('users').orderByChild('name').once('value');
        const users = [];
        snapshot.forEach(child => {
            users.push({ id: child.key, ...child.val() });
        });
        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).send({ message: 'Gagal mengambil data pengguna', error: error.message });
    }
};

// Mendapatkan detail satu pengguna beserta riwayat pemesanannya
exports.getUserDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const userSnapshot = await db.ref(`users/${id}`).once('value');

        if (!userSnapshot.exists()) {
            return res.status(404).send({ message: 'Pengguna tidak ditemukan' });
        }
        
        // Mengambil data pemesanan milik pengguna tersebut
        const bookingsSnapshot = await db.ref('bookings').orderByChild('userId').equalTo(id).once('value');
        const bookings = [];
        bookingsSnapshot.forEach(child => {
            bookings.push({ id: child.key, ...child.val() });
        });

        const userData = { id: userSnapshot.key, ...userSnapshot.val() };
        res.status(200).json({ user: userData, bookings: bookings.reverse() });

    } catch (error) {
        console.error("Error fetching user details:", error);
        res.status(500).send({ message: 'Gagal mengambil detail pengguna', error: error.message });
    }
};