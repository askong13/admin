const { db } = require('../config/firebase');

// Mendapatkan semua lokasi
exports.getAllLocations = async (req, res) => {
    try {
        const snapshot = await db.ref('storageLocations').orderByChild('name').once('value');
        const locations = [];
        snapshot.forEach(childSnapshot => {
            locations.push({ id: childSnapshot.key, ...childSnapshot.val() });
        });
        res.status(200).json(locations);
    } catch (error) {
        console.error("Error fetching locations:", error);
        res.status(500).send({ message: 'Gagal mengambil data lokasi', error: error.message });
    }
};

// Menambah lokasi baru
exports.addLocation = async (req, res) => {
    try {
        const { name, address, capacity, imageUrl, features } = req.body;
        
        if (!name || !address || !capacity) {
            return res.status(400).send({ message: 'Nama, alamat, dan kapasitas harus diisi.' });
        }

        const newLocation = {
            name,
            address,
            capacity: parseInt(capacity, 10),
            imageUrl: imageUrl || '',
            features: features || [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
            // Geolocation default, bisa diupdate nanti melalui Google Maps API di frontend
            geolocation: { latitude: -8.409518, longitude: 115.188919 } 
        };
        const locationRef = await db.ref('storageLocations').push(newLocation);
        res.status(201).send({ id: locationRef.key, ...newLocation });
    } catch (error) {
        console.error("Error adding location:", error);
        res.status(500).send({ message: 'Gagal menambah lokasi baru', error: error.message });
    }
};

// Memperbarui lokasi yang ada
exports.updateLocation = async (req, res) => {
    try {
        const { id } = req.params;
        const locationData = req.body;

        if (!id) {
            return res.status(400).send({ message: 'ID Lokasi dibutuhkan.' });
        }
        
        locationData.updatedAt = Date.now();
        await db.ref(`storageLocations/${id}`).update(locationData);
        res.status(200).send({ message: 'Lokasi berhasil diperbarui' });
    } catch (error) {
        console.error("Error updating location:", error);
        res.status(500).send({ message: 'Gagal memperbarui lokasi', error: error.message });
    }
};

// Menghapus lokasi
exports.deleteLocation = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).send({ message: 'ID Lokasi dibutuhkan.' });
        }
        await db.ref(`storageLocations/${id}`).remove();
        res.status(200).send({ message: 'Lokasi berhasil dihapus' });
    } catch (error) {
        console.error("Error deleting location:", error);
        res.status(500).send({ message: 'Gagal menghapus lokasi', error: error.message });
    }
};