const { db } = require('../config/firebase');

exports.getAllVouchers = async (req, res) => {
    try {
        const snapshot = await db.ref('vouchers').orderByChild('code').once('value');
        const vouchers = [];
        snapshot.forEach(child => {
            vouchers.push({ id: child.key, ...child.val() });
        });
        res.status(200).json(vouchers);
    } catch (error) {
        console.error("Error fetching vouchers:", error);
        res.status(500).send({ message: 'Gagal mengambil data voucher', error: error.message });
    }
};

exports.addVoucher = async (req, res) => {
    try {
        const newVoucher = req.body;
        if (!newVoucher.code || !newVoucher.discount_percent) {
            return res.status(400).send({ message: 'Kode dan persentase diskon harus diisi.' });
        }
        newVoucher.createdAt = Date.now();
        newVoucher.usedCount = newVoucher.usedCount || 0;
        const voucherRef = await db.ref('vouchers').push(newVoucher);
        res.status(201).send({ id: voucherRef.key, ...newVoucher });
    } catch (error) {
        console.error("Error adding voucher:", error);
        res.status(500).send({ message: 'Gagal menambah voucher', error: error.message });
    }
};

exports.updateVoucher = async (req, res) => {
    try {
        const { id } = req.params;
        const voucherData = req.body;
        await db.ref(`vouchers/${id}`).update(voucherData);
        res.status(200).send({ message: 'Voucher berhasil diperbarui' });
    } catch (error) {
        console.error("Error updating voucher:", error);
        res.status(500).send({ message: 'Gagal memperbarui voucher', error: error.message });
    }
};

exports.deleteVoucher = async (req, res) => {
    try {
        const { id } = req.params;
        await db.ref(`vouchers/${id}`).remove();
        res.status(200).send({ message: 'Voucher berhasil dihapus' });
    } catch (error) {
        console.error("Error deleting voucher:", error);
        res.status(500).send({ message: 'Gagal menghapus voucher', error: error.message });
    }
};