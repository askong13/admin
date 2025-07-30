const { db } = require('../config/firebase');

// Mendapatkan semua FAQ
exports.getAllFaqs = async (req, res) => {
    try {
        // Mengurutkan berdasarkan 'order' jika ada, atau createdAt
        const snapshot = await db.ref('faqs').orderByChild('order').once('value');
        const faqs = [];
        snapshot.forEach(child => {
            faqs.push({ id: child.key, ...child.val() });
        });
        res.status(200).json(faqs);
    } catch (error) {
        console.error("Error fetching FAQs:", error);
        res.status(500).send({ message: 'Gagal mengambil data FAQ', error: error.message });
    }
};

// Menambahkan FAQ baru
exports.addFaq = async (req, res) => {
    try {
        const { q, a, order } = req.body;
        if (!q || !a) {
            return res.status(400).send({ message: 'Pertanyaan (q) dan jawaban (a) harus diisi.' });
        }
        const newFaq = { q, a, order: order || 99, createdAt: Date.now() };
        const faqRef = await db.ref('faqs').push(newFaq);
        res.status(201).send({ id: faqRef.key, ...newFaq });
    } catch (error) {
        console.error("Error adding FAQ:", error);
        res.status(500).send({ message: 'Gagal menambah FAQ', error: error.message });
    }
};

// Memperbarui FAQ
exports.updateFaq = async (req, res) => {
    try {
        const { id } = req.params;
        const faqData = req.body;
        await db.ref(`faqs/${id}`).update(faqData);
        res.status(200).send({ message: 'FAQ berhasil diperbarui' });
    } catch (error) {
        console.error("Error updating FAQ:", error);
        res.status(500).send({ message: 'Gagal memperbarui FAQ', error: error.message });
    }
};

// Menghapus FAQ
exports.deleteFaq = async (req, res) => {
    try {
        const { id } = req.params;
        await db.ref(`faqs/${id}`).remove();
        res.status(200).send({ message: 'FAQ berhasil dihapus' });
    } catch (error) {
        console.error("Error deleting FAQ:", error);
        res.status(500).send({ message: 'Gagal menghapus FAQ', error: error.message });
    }
};