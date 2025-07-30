const { auth } = require('../config/firebase');

/**
 * Menangani login admin.
 * Di aplikasi Flutter, prosesnya akan seperti ini:
 * 1. Admin memasukkan email/password di Flutter.
 * 2. Flutter menggunakan Firebase Auth SDK untuk login.
 * 3. Jika berhasil, Flutter mendapatkan ID Token.
 * 4. Flutter mengirimkan ID Token tersebut ke semua permintaan ke backend.
 * * Endpoint ini dibuat untuk memberikan token kustom jika diperlukan
 * atau sebagai metode login alternatif yang dikelola backend.
 */
exports.adminLogin = async (req, res) => {
    const { email, password } = req.body;

    // Validasi sederhana menggunakan variabel lingkungan.
    // DI PRODUKSI: Gunakan sistem yang lebih aman, misalnya mengecek
    // koleksi 'admins' di database.
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
        try {
            // Jika Anda ingin membuat token untuk user yang sudah ada di Firebase Auth
            // const user = await auth.getUserByEmail(email);
            // const customToken = await auth.createCustomToken(user.uid);
            // return res.status(200).json({ token: customToken });

            // Untuk saat ini, kita hanya kirim pesan sukses.
            // Flutter akan menangani login dan mendapatkan ID token sendiri.
            return res.status(200).json({ 
                success: true, 
                message: "Admin credentials are valid. Please proceed with Firebase login on the client." 
            });

        } catch (error) {
            console.error("Login error:", error);
            return res.status(500).json({ success: false, message: 'Internal server error.' });
        }
    } else {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
};