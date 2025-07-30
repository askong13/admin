const { db } = require('../config/firebase');

// Mendapatkan semua data pemesanan
exports.getAllBookings = async (req, res) => {
    try {
        const snapshot = await db.ref('bookings').orderByChild('createdAt').once('value');
        const bookings = [];
        snapshot.forEach(child => {
            bookings.push({ id: child.key, ...child.val() });
        });
        // Balik urutan array agar data terbaru muncul di paling atas
        res.status(200).json(bookings.reverse());
    } catch (error) {
        console.error("Error fetching bookings:", error);
        res.status(500).send({ message: 'Gagal mengambil data pemesanan', error: error.message });
    }
};

// Menambahkan pemesanan baru (biasanya dilakukan oleh admin)
exports.addBooking = async (req, res) => {
    try {
        const newBookingData = req.body;
        
        if (!newBookingData.userId || !newBookingData.locationId || !newBookingData.unitSize) {
            return res.status(400).send({ message: 'User ID, Location ID, dan Unit Size harus diisi.' });
        }

        newBookingData.createdAt = Date.now();
        newBookingData.bookingStatus = newBookingData.bookingStatus || 'active';

        // Mengurangi kapasitas unit di lokasi yang dipilih
        const locationRef = db.ref(`storageLocations/${newBookingData.locationId}`);
        const transaction = await locationRef.transaction(location => {
            if (location && location.capacity > 0) {
                location.capacity--;
                return location;
            }
            // Batalkan transaksi jika tidak ada lokasi atau kapasitas habis
            return; 
        });

        if (!transaction.committed) {
            return res.status(409).send({ message: 'Kapasitas di lokasi ini tidak tersedia.' });
        }

        const bookingRef = await db.ref('bookings').push(newBookingData);
        res.status(201).send({ id: bookingRef.key, ...newBookingData });

    } catch (error) {
        console.error("Error adding booking:", error);
        res.status(500).send({ message: 'Gagal menambah pemesanan baru', error: error.message });
    }
};

// Memperbarui status pemesanan (misal: check-in, check-out, cancel)
exports.updateBookingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // Status baru: 'checked_in', 'completed', 'cancelled'

        if (!status) {
            return res.status(400).send({ message: 'Status baru dibutuhkan.'});
        }
        
        const bookingRef = db.ref(`bookings/${id}`);
        const bookingSnapshot = await bookingRef.once('value');
        const bookingData = bookingSnapshot.val();

        if (!bookingData) {
            return res.status(404).send({ message: 'Pemesanan tidak ditemukan.' });
        }

        const oldStatus = bookingData.bookingStatus;
        const updates = { bookingStatus: status };

        // Tambahkan waktu check-in atau check-out sesuai status
        if (status === 'checked_in') updates.checkInTime = Date.now();
        if (status === 'completed') updates.checkOutTime = Date.now();
        
        // Logika untuk mengembalikan kapasitas unit jika booking dibatalkan atau selesai
        const shouldRestoreCapacity = 
            (status === 'completed' || status === 'cancelled') &&
            !['completed', 'cancelled'].includes(oldStatus);

        if (shouldRestoreCapacity && !bookingData.isExtension) {
            const locationRef = db.ref(`storageLocations/${bookingData.locationId}`);
            await locationRef.transaction(location => {
                if (location) {
                    location.capacity = (location.capacity || 0) + 1;
                }
                return location;
            });
        }

        await bookingRef.update(updates);
        res.status(200).send({ message: `Status pemesanan berhasil diubah menjadi ${status}` });

    } catch (error) {
        console.error("Error updating booking status:", error);
        res.status(500).send({ message: 'Gagal memperbarui status pemesanan', error: error.message });
    }
};

// Memperbarui detail pemesanan (misal: tanggal, harga, dll)
exports.updateBookingDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const dataToUpdate = req.body;
        dataToUpdate.updatedAt = Date.now();

        await db.ref(`bookings/${id}`).update(dataToUpdate);
        res.status(200).send({ message: 'Detail pemesanan berhasil diperbarui.' });
    } catch (error) {
        console.error("Error updating booking details:", error);
        res.status(500).send({ message: 'Gagal memperbarui detail pemesanan', error: error.message });
    }
};