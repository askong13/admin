const { db } = require('../config/firebase');

exports.getDashboardOverview = async (req, res) => {
    try {
        // Mengambil data booking dan lokasi secara paralel untuk efisiensi
        const [bookingsSnapshot, locationsSnapshot] = await Promise.all([
            db.ref('bookings').once('value'),
            db.ref('storageLocations').once('value')
        ]);
        
        const allBookings = [];
        bookingsSnapshot.forEach(child => {
            allBookings.push({ id: child.key, ...child.val() });
        });

        // 1. Total Lokasi
        const totalLocations = locationsSnapshot.numChildren();

        // 2. Booking Aktif
        const now = Date.now();
        const activeBookings = allBookings.filter(b => 
            ['active', 'checked_in'].includes(b.bookingStatus) && b.endDate > now
        ).length;

        // 3. Notifikasi Booking akan berakhir (dalam 7 hari)
        const sevenDaysFromNow = now + (7 * 24 * 60 * 60 * 1000);
        const upcomingExpirations = allBookings.filter(b =>
            ['active', 'checked_in'].includes(b.bookingStatus) && b.endDate > now && b.endDate <= sevenDaysFromNow
        ).length;

        // 4. Statistik Pendapatan
        const paidBookings = allBookings.filter(b => b.paymentStatus === 'paid');
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth();

        let totalRevenue = 0;
        let yearlyRevenue = 0;
        let monthlyRevenue = 0;

        paidBookings.forEach(b => {
            const bookingPrice = b.totalPrice || 0;
            totalRevenue += bookingPrice;

            const bookingDate = new Date(b.createdAt);
            if (bookingDate.getFullYear() === currentYear) {
                yearlyRevenue += bookingPrice;
                if (bookingDate.getMonth() === currentMonth) {
                    monthlyRevenue += bookingPrice;
                }
            }
        });

        // 5. Booking Terbaru (5 data terakhir)
        const recentBookings = allBookings
            .sort((a, b) => b.createdAt - a.createdAt)
            .slice(0, 5);

        // Mengirim semua data yang sudah diproses sebagai satu objek JSON
        res.status(200).json({
            stats: {
                totalLocations,
                activeBookings,
                upcomingExpirations,
            },
            revenue: {
                totalRevenue,
                yearlyRevenue,
                monthlyRevenue,
            },
            recentBookings
        });

    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        res.status(500).send({ message: 'Gagal mengambil data dashboard', error: error.message });
    }
};