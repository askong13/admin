// =================================================================
// KONFIGURASI DAN VARIABEL GLOBAL
// =================================================================
const firebaseConfig = {
    apiKey: "AIzaSyBeX6K3ejM-zu755LVDDMwgxBi-KW-ogx4",
    authDomain: "storapedia.firebaseapp.com",
    projectId: "storapedia",
    storageBucket: "storapedia.appspot.com",
    messagingSenderId: "145464021088",
    appId: "1:145464021088:web:1e24a2847994ac5003f305",
    databaseURL: "https://storapedia-default-rtdb.firebaseio.com/"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database(); // Kita tetap butuh ini untuk beberapa operasi real-time jika diperlukan

let adminUser = null;
let qrCodeScanner = null;

const currencyFormatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
});

// =================================================================
// FUNGSI UTAMA SAAT HALAMAN DIMUAT
// =================================================================
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    checkAdminAuth();
});

function checkAdminAuth() {
    auth.onAuthStateChanged(user => {
        const loginModal = document.getElementById('login-modal');
        if (user) {
            adminUser = user;
            loginModal.classList.add('hidden');
            loginModal.classList.remove('flex');
            loadInitialData();
        } else {
            adminUser = null;
            loginModal.classList.add('flex');
            loginModal.classList.remove('hidden');
            if (qrCodeScanner) {
                qrCodeScanner.stop().catch(err => console.warn("Error stopping QR scanner", err));
            }
        }
    });
}

function loadInitialData() {
    const dashboardLink = document.querySelector('.sidebar-link[data-section="dashboard"]');
    if (dashboardLink) {
        dashboardLink.classList.add('active-link');
    }
    showSection('dashboard');
    loadDashboardData();
    loadLocations();
    loadBookings();
    loadUsers();
}

// =================================================================
// FUNGSI-FUNGSI UNTUK MENGAMBIL DATA DARI DATABASE (Firebase)
// Di sini kita masih menggunakan SDK Firebase sisi klien seperti kode asli Anda.
// =================================================================

async function loadDashboardData() {
    try {
        const locationsSnapshot = await db.ref('storageLocations').once('value');
        const bookingsSnapshot = await db.ref('bookings').once('value');
        const allBookings = [];
        bookingsSnapshot.forEach(child => allBookings.push({ id: child.key, ...child.val() }));

        const now = Date.now();
        const activeBookings = allBookings.filter(b => ['active', 'checked_in'].includes(b.bookingStatus) && b.endDate > now).length;
        const upcomingExpirations = allBookings.filter(b => ['active', 'checked_in'].includes(b.bookingStatus) && b.endDate > now && b.endDate <= (now + 7*24*60*60*1000)).length;
        
        let totalRevenue = 0;
        allBookings.filter(b => b.paymentStatus === 'paid').forEach(b => totalRevenue += (b.totalPrice || 0));

        // Update UI (dengan pengecekan elemen)
        const statTotalLocations = document.getElementById('stat-total-locations');
        if (statTotalLocations) statTotalLocations.textContent = locationsSnapshot.numChildren();
        
        const statActiveBookings = document.getElementById('stat-active-bookings');
        if (statActiveBookings) statActiveBookings.textContent = activeBookings;

        const statUpcomingExpirations = document.getElementById('stat-upcoming-expirations');
        if(statUpcomingExpirations) statUpcomingExpirations.textContent = upcomingExpirations;

        const statTotalRevenue = document.getElementById('stat-total-revenue');
        if(statTotalRevenue) statTotalRevenue.textContent = currencyFormatter.format(totalRevenue);

    } catch (error) {
        console.error("Error loading dashboard data:", error);
    }
}

async function loadLocations() {
    try {
        const snapshot = await db.ref('storageLocations').once('value');
        const locations = [];
        snapshot.forEach(child => locations.push({ id: child.key, ...child.val() }));
        renderLocationsList(locations);
    } catch (error) {
        console.error("Error loading locations:", error);
    }
}

async function loadBookings() {
    try {
        const snapshot = await db.ref('bookings').once('value');
        const bookings = [];
        snapshot.forEach(child => bookings.push({ id: child.key, ...child.val() }));
        renderBookingsList(bookings.reverse());
    } catch (error) {
        console.error("Error loading bookings:", error);
    }
}

async function loadUsers() {
    try {
        const snapshot = await db.ref('users').once('value');
        const users = [];
        snapshot.forEach(child => users.push({ id: child.key, ...child.val() }));
        renderUsersList(users.reverse());
    } catch (error) {
        console.error("Error loading users:", error);
    }
}

// =================================================================
// FUNGSI-FUNGSI UNTUK MERENDER DATA KE HTML (YANG SEBELUMNYA HILANG)
// =================================================================

function renderLocationsList(locations) {
    const container = document.getElementById('locations-list-content');
    if (!container) return;
    container.innerHTML = '';
    if (locations.length === 0) {
        container.innerHTML = '<p class="text-center p-4">Belum ada lokasi.</p>';
        return;
    }
    const tableBody = locations.map(loc => `
        <tr class="responsive-table-row">
            <td>${loc.name || ''}</td>
            <td>${loc.address || ''}</td>
            <td>${loc.capacity || 0}</td>
            <td>${loc.features ? loc.features.map(f => f.name).join(', ') : 'N/A'}</td>
            <td></td>
        </tr>
    `).join('');
    container.innerHTML = `<tbody>${tableBody}</tbody>`;
}

function renderBookingsList(bookings) {
    const container = document.getElementById('bookings-list-content');
    if (!container) return;
    container.innerHTML = '';
    if (bookings.length === 0) {
        container.innerHTML = '<p class="text-center p-4">Belum ada pemesanan.</p>';
        return;
    }
    const tableBody = bookings.map(b => `
         <tr class="responsive-table-row">
            <td>${b.id.substring(0, 8)}...</td>
            <td>${b.userId ? b.userId.substring(0, 8) : 'Guest'}...</td>
            <td>${b.locationName || ''}</td>
            <td>${new Date(b.startDate).toLocaleDateString()}</td>
            <td>${b.bookingStatus || ''}</td>
            <td></td>
        </tr>
    `).join('');
    container.innerHTML = `<tbody>${tableBody}</tbody>`;
}

function renderUsersList(users) {
    const container = document.getElementById('users-list-content');
    if (!container) return;
    container.innerHTML = '';
    if (users.length === 0) {
        container.innerHTML = '<p class="text-center p-4">Belum ada pengguna.</p>';
        return;
    }
    const tableBody = users.map(u => `
         <tr class="responsive-table-row">
            <td>${u.id.substring(0, 8)}...</td>
            <td>${u.name || ''}</td>
            <td>${u.email || ''}</td>
            <td>${u.phone || 'N/A'}</td>
            <td></td>
        </tr>
    `).join('');
    container.innerHTML = `<tbody>${tableBody}</tbody>`;
}

// =================================================================
// FUNGSI AKSI DAN EVENT LISTENERS
// =================================================================

async function handleAdminLogin(e) {
    e.preventDefault();
    const email = document.getElementById('admin-email').value;
    const password = document.getElementById('admin-password').value;
    const loginBtn = document.getElementById('admin-login-btn');
    loginBtn.disabled = true;
    loginBtn.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i>Logging In...`;
    try {
        await auth.signInWithEmailAndPassword(email, password);
    } catch (error) {
        Swal.fire('Login Gagal', error.message, 'error');
    } finally {
        loginBtn.disabled = false;
        loginBtn.innerHTML = 'Login';
    }
}

function handleAdminLogout() {
    auth.signOut().catch(error => console.error("Logout error:", error));
}

function setupEventListeners() {
    const loginForm = document.getElementById('admin-login-form');
    if (loginForm) loginForm.addEventListener('submit', handleAdminLogin);

    const logoutBtn = document.getElementById('admin-logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', handleAdminLogout);
    
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = e.currentTarget.dataset.section;
            showSection(sectionId);
        });
    });
}

function showSection(sectionId) {
    document.querySelectorAll('.section-content').forEach(section => {
        section.classList.remove('active');
    });
    const activeSection = document.getElementById(sectionId);
    if(activeSection) activeSection.classList.add('active');

    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.classList.remove('active-link');
        if (link.dataset.section === sectionId) {
            link.classList.add('active-link');
        }
    });
}