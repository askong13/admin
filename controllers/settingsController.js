const { db } = require('../config/firebase');

// Mendapatkan semua pengaturan
exports.getSettings = async (req, res) => {
    try {
        const snapshot = await db.ref('settings').once('value');
        res.status(200).json(snapshot.val());
    } catch (error) {
        console.error("Error fetching settings:", error);
        res.status(500).send({ message: 'Gagal mengambil data pengaturan', error: error.message });
    }
};

// Memperbarui pengaturan harga
exports.updatePricing = async (req, res) => {
    try {
        const pricingData = req.body;
        await db.ref('settings/pricing').update(pricingData);
        res.status(200).send({ message: 'Pengaturan harga berhasil diperbarui' });
    } catch (error) {
        console.error("Error updating pricing:", error);
        res.status(500).send({ message: 'Gagal memperbarui pengaturan harga', error: error.message });
    }
};

// Memperbarui pengaturan footer links
exports.updateFooterLinks = async (req, res) => {
    try {
        const footerLinksData = req.body;
        await db.ref('settings/footerLinks').set(footerLinksData); // Gunakan .set() untuk menimpa seluruh objek
        res.status(200).send({ message: 'Pengaturan footer links berhasil diperbarui' });
    } catch (error) {
        console.error("Error updating footer links:", error);
        res.status(500).send({ message: 'Gagal memperbarui footer links', error: error.message });
    }
};