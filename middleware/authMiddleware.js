const { auth } = require('../config/firebase');

/**
 * Middleware untuk memverifikasi Firebase ID Token yang dikirim
 * di header Authorization.
 */
exports.verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log("No token provided or malformed header");
        return res.status(403).send({ message: 'Unauthorized: No token provided.' });
    }

    const idToken = authHeader.split('Bearer ')[1];

    try {
        // Verifikasi token menggunakan Firebase Admin SDK
        const decodedToken = await auth.verifyIdToken(idToken);
        
        // Anda bisa menambahkan pengecekan tambahan di sini, misalnya:
        // Apakah UID dari token ini termasuk dalam daftar admin di database?
        // const isAdmin = await checkAdminRole(decodedToken.uid);
        // if (!isAdmin) {
        //   return res.status(403).send({ message: 'Forbidden: User is not an admin.' });
        // }
        
        // Simpan informasi pengguna yang terdekode di objek request
        // agar bisa digunakan di controller selanjutnya
        req.user = decodedToken;

        // Lanjutkan ke fungsi controller berikutnya
        next();
    } catch (error) {
        console.error('Error verifying token:', error.message);
        return res.status(403).send({ message: 'Unauthorized: Invalid token.' });
    }
};