/* ADMIN JS - ULTIMATE IMAGE FIX (THUMBNAIL METHOD) */

// URL GOOGLE SCRIPT (Pastikan URL ini sama dengan Web App URL Anda)
const API_URL = 'https://script.google.com/macros/s/AKfycbxyeYGEIJ3MHytVXioIdgYXBJOvsWhinjRsVR4nbnczX0NxveaADMI-DaXhg6sUjfyo/exec'; 

// Cache Data Global
let globalUsersData = [];
let globalBeritaData = [];
let globalPKBMData = [];
let globalGaleriPKBMData = [];
let globalBannerData = [];
let globalPejabatData = [];
let globalKlinikData = [];
let globalInfoPublikData = [];
let globalGaleriKlinikData = []; // Tambahkan ini di bagian cache data global
let globalReintegrasiData = [];
let globalLayananKunjunganData = [];

// --- DEFINISI MODAL GLOBAL ---
let modalEditBerita, modalEditGaleri, modalEditBanner, modalLoading, modalEditPejabat, modalEditInfoPublik, modalEditGaleriKlinik, modalEditReintegrasi;

document.addEventListener('DOMContentLoaded', () => {
    // 1. Inisialisasi Modal
    if(document.getElementById('editBeritaModal')) modalEditBerita = new bootstrap.Modal(document.getElementById('editBeritaModal'));
    if(document.getElementById('editGaleriPKBMModal')) modalEditGaleri = new bootstrap.Modal(document.getElementById('editGaleriPKBMModal'));
    if(document.getElementById('editBannerModal')) modalEditBanner = new bootstrap.Modal(document.getElementById('editBannerModal'));
    if(document.getElementById('loadingModal')) modalLoading = new bootstrap.Modal(document.getElementById('loadingModal'));
    if(document.getElementById('editPejabatModal')) modalEditPejabat = new bootstrap.Modal(document.getElementById('editPejabatModal'));
    if(document.getElementById('editInfoPublikModal')) modalEditInfoPublik = new bootstrap.Modal(document.getElementById('editInfoPublikModal'));
    if(document.getElementById('editGaleriKlinikModal')) modalEditGaleriKlinik = new bootstrap.Modal(document.getElementById('editGaleriKlinikModal'));
    if(document.getElementById('editReintegrasiModal')) modalEditReintegrasi = new bootstrap.Modal(document.getElementById('editReintegrasiModal'));
    if(document.getElementById('tab-layanan_kunjungan') || document.getElementById('table-layanan-kunjungan')) {
        loadLayananKunjungan();
    }
    // 2. Cek Login Session
    if(sessionStorage.getItem('isLoggedIn') === 'true') showDashboard();

    // 3. Login Enter Key
    ['username', 'password'].forEach(id => {
        const el = document.getElementById(id);
        if(el) el.addEventListener('keypress', (e) => { if(e.key === 'Enter') login(); });
    });
});
        // Inisialisasi data Layanan Kunjungan saat tab dimuat
        if(document.getElementById('tab-layanan_kunjungan')) {
            loadLayananKunjungan();
        }

async function fetchUsers() {
            try {
                const response = await fetch(API_URL);
                const data = await response.json();
                if (data.users) {
                    globalUsersData = data.users;
                }
            } catch (e) {
                console.error("Gagal mengambil data user:", e);
            }
        }


// --- 1. OTENTIKASI ---
async function login() {
    const u = document.getElementById('username').value;
    const p = document.getElementById('password').value;
    const errorEl = document.getElementById('login-error'); //
    
    // Tampilkan loading saat mengecek
    const btnLogin = document.querySelector("button[onclick='login()']");
    const originalText = btnLogin.innerText;
    btnLogin.innerText = "MENGECEK...";
    btnLogin.disabled = true;

    try {
        // Ambil data terbaru dari API jika globalUsersData kosong
        if (globalUsersData.length === 0) {
            const response = await fetch(API_URL);
            const data = await response.json();
            globalUsersData = data.users || [];
        }

        // Cari kecocokan di data sheet
        const userFound = globalUsersData.find(user => user.username === u && user.password === p);

        if (userFound) {
            sessionStorage.setItem('isLoggedIn', 'true'); 
            showDashboard(); //
        } else {
            errorEl.style.display = 'block'; //
            const box = document.querySelector('.login-box'); //
            box.classList.add('shake-animation');
            setTimeout(() => box.classList.remove('shake-animation'), 500);
        }
    } catch (error) {
        alert("Terjadi kesalahan koneksi saat login.");
    } finally {
        btnLogin.innerText = originalText;
        btnLogin.disabled = false;
    }
}

function showDashboard() {
    document.getElementById('login-overlay').style.display = 'none';
    document.getElementById('dashboard-wrapper').style.display = 'block';
    initDashboard(); 
}

function logout() {
    Swal.fire({
        title: 'Konfirmasi Keluar',
        text: "Apakah Anda yakin ingin mengakhiri sesi ini?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Ya, Logout!',
        cancelButtonText: 'Batal'
    }).then((result) => {
        if (result.isConfirmed) {
            sessionStorage.removeItem('isLoggedIn');
            location.reload();
        }
    })
}

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
    document.getElementById('tab-' + tabId).style.display = 'block';
    document.querySelectorAll('#sidebar li').forEach(el => el.classList.remove('active'));
    event.currentTarget.parentElement.classList.add('active');
}

document.getElementById('sidebarCollapse').addEventListener('click', function() {
    document.getElementById('sidebar').classList.toggle('active');
    document.getElementById('dashboard-wrapper').classList.toggle('sidebar-collapsed');
});

// --- 2. PENGAMBILAN DATA ---

function addRowIds(arr) {
    return Array.isArray(arr) ? arr.map((item, i) => ({ ...item, rowId: item.rowId || (i + 2) })) : [];
}

async function initDashboard() {
    const statusEl = document.getElementById('db-status');
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        console.log('API Response:', data); 

        statusEl.className = 'badge bg-success me-3';
        statusEl.innerHTML = '<i class="fas fa-check-circle me-1"></i> Terhubung';

        if(data.berita) { globalBeritaData = addRowIds(data.berita); renderBeritaTable(globalBeritaData); }
        if(data.pkbm) { globalPKBMData = addRowIds(data.pkbm); renderPKBMStats(globalPKBMData); }
        if(data.galeri_pkbm) { globalGaleriPKBMData = addRowIds(data.galeri_pkbm); renderPKBMGallery(globalGaleriPKBMData); }
        if(data.banner) { globalBannerData = addRowIds(data.banner); renderBannerTable(globalBannerData); }
        if(data.klinik) { globalKlinikData = addRowIds(data.klinik); renderKlinikTable(globalKlinikData); renderKlinikChart(data.klinik[0]); }
        if(data.galeri_klinik) { renderGaleriKlinik(addRowIds(data.galeri_klinik)); }
        if(data.pejabat) { globalPejabatData = addRowIds(data.pejabat); renderPejabatTable(globalPejabatData); }
        if(data.infopublik) {
            globalInfoPublikData = addRowIds(data.infopublik);
            renderInfoPublikTable(globalInfoPublikData);
            updateKategoriDropdown(globalInfoPublikData);
        }
        if(data.reintegrasi) {
            globalReintegrasiData = addRowIds(data.reintegrasi);
            renderReintegrasiTable(globalReintegrasiData);
        }
if (data.layanankunjungan) {
            globalLayananKunjunganData = addRowIds(data.layanankunjungan);
            renderLayananKunjunganTable(globalLayananKunjunganData);
        }

    } catch (e) {
        console.error(e);
        statusEl.className = 'badge bg-danger me-3';
        statusEl.innerHTML = '<i class="fas fa-times-circle me-1"></i> Disconnected';
    }
}
async function loadLayananKunjungan() {
    try {
        const res = await fetch(API_URL); 
        const json = await res.json();  
        
        const dataTarget = json.layanankunjungan || json.LayananKunjungan || [];
        globalLayananKunjunganData = typeof addRowIds === 'function' ? addRowIds(dataTarget) : dataTarget;
        
        if(typeof renderLayananKunjunganTable === 'function') {
            renderLayananKunjunganTable(globalLayananKunjunganData);
        }
        
        // --- LOGIKA TOMBOL PREVIEW ---
        const sopBtn = document.getElementById('url_sop');
        
        if (globalLayananKunjunganData.length > 0 && sopBtn) {
            const currentLink = globalLayananKunjunganData[0].link || globalLayananKunjunganData[0].url_sop; 
            
            if (currentLink && currentLink !== '-' && currentLink.trim() !== '' && currentLink.includes('http')) {
                // State: AKTIF
                sopBtn.disabled = false;
                sopBtn.innerHTML = '<i class="fas fa-eye me-2"></i> Preview Dokumen SOP';
                sopBtn.className = "btn btn-primary fw-bold shadow-sm"; // Ubah ke warna solid
                
                sopBtn.onclick = function(e) {
                    e.preventDefault();
                    previewDokumen(currentLink); 
                };
            } else {
                // State: NON-AKTIF
                sopBtn.disabled = true;
                sopBtn.innerHTML = '<i class="fas fa-eye-slash me-2"></i> SOP Tidak Tersedia';
                sopBtn.className = "btn btn-secondary fw-bold shadow-sm opacity-50";
                sopBtn.onclick = null;
            }
        } 

    } catch (e) {
        console.error("Gagal load layanan kunjungan:", e);
        if(typeof renderLayananKunjunganTable === 'function') renderLayananKunjunganTable([]);
    }
}

// --- FUNGSI HELPER FILE PROCESSING ---
function processFileField(inputId, key, object) {
    return new Promise((resolve) => {
        const input = document.getElementById(inputId);
        if (input && input.files && input.files.length > 0) {
            const file = input.files[0];
            const reader = new FileReader();
            reader.onload = function(e) {
                object[key] = {
                    fileName: file.name,
                    mimeType: file.type,
                    data: e.target.result.split(',')[1]
                };
                resolve();
            };
            reader.readAsDataURL(file);
        } else {
            resolve();
        }
    });
}

// --- KONVERSI LINK GOOGLE DRIVE (METODE THUMBNAIL - LEBIH STABIL) ---
function convertDriveToDirectLink(url) {
    if (!url) return 'https://placehold.co/100x100?text=No+Image';

    // 1. Cek apakah URL sudah format thumbnail? Jika ya, return
    if (url.includes('drive.google.com/thumbnail')) return url;

    // 2. Ekstrak ID (Support berbagai format URL Drive)
    let id = '';
    
    // Pola 1: id=XXXX (Format dari script upload kita)
    let match = url.match(/id=([a-zA-Z0-9_-]{15,})/); 
    if (match) id = match[1];
    else {
        // Pola 2: /d/XXXX (Format copy link manual)
        match = url.match(/\/d\/([a-zA-Z0-9_-]{15,})/);
        if (match) id = match[1];
    }

    // 3. Return Link Thumbnail Resolusi Tinggi (sz=w1000)
    // Ini mendukung PNG Transparan dan jarang kena blokir 403
    if (id) {
        return `https://drive.google.com/thumbnail?id=${id}&sz=w1000`;
    }

    return url;
}
function renderLayananKunjunganTable(data) {
    const tbody = document.querySelector('#table-layanan-kunjungan tbody');
    if (!tbody) return;
    if (!Array.isArray(data) || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center py-3">Belum ada data.</td></tr>';
        return;
    }
    let html = '';
    data.forEach(item => {
        let displayJadwal = (item.jadwal || '-').replace(/\n/g, '<br>');

        html += `<tr>
            <td>${displayJadwal}</td>
            <td>${item.syarat || '-'}</td>
            <td>${item.himbauan || '-'}</td>
            <td>${item.catatan || '-'}</td>
            <td class="text-center">
                <button class="btn btn-sm btn-warning" onclick="editKunjungan(${item.rowId})">
                    <i class="fas fa-edit me-1"></i> Edit
                </button>
            </td>
        </tr>`;
    });
    tbody.innerHTML = html;
}
// --- RENDER TABEL ---
function renderBannerTable(data) {
    const tbody = document.querySelector('#table-banner tbody');
    if(!tbody) return;
    let html = '';
    data.slice().reverse().forEach(item => {
        let img = convertDriveToDirectLink(item.gambar);
        html += `<tr>
            <td><img src="${img}" style="width:60px;height:40px;object-fit:cover;border-radius:4px;" onerror="this.onerror=null; this.src='https://placehold.co/100x100?text=Img';"></td>
            <td>${item.judul}</td>
            <td>${item.deskripsi || ''}</td>
            <td class="text-center">
                <button class="btn btn-sm btn-warning me-1" onclick="openEditBannerModal(${item.rowId})"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-danger" onclick="deleteData('Banner', ${item.rowId})"><i class="fas fa-trash"></i></button>
            </td>
        </tr>`;
    });
    tbody.innerHTML = html || '<tr><td colspan="4" class="text-center py-3">Belum ada data.</td></tr>';
}

function renderBeritaTable(data) {
    const tbody = document.querySelector('#table-berita tbody');
    if (!tbody) return;

    // 1. Validasi jika data kosong
    if (!data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center py-3">Belum ada data.</td></tr>';
        return;
    }

    // 2. Sorting data berdasarkan tanggal terbaru (descending)
    // Kita gunakan slice() agar tidak merusak array asli
    const sortedData = data.slice().sort((a, b) => {
        const dateA = new Date(a.tanggal);
        const dateB = new Date(b.tanggal);
        return dateB - dateA; // Tanggal terbaru dikurangi tanggal lama
    });

    let html = '';

    // 3. Render data ke dalam HTML
    sortedData.forEach(item => {
        // Format Tanggal
        const tgl = item.tanggal ? new Date(item.tanggal).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        }) : '-';

        // Konversi Link Gambar
        const img = convertDriveToDirectLink(item.gambar1);

        html += `
        <tr>
            <td class="align-middle">
                <img src="${img}" 
                     style="width:60px; height:40px; object-fit:cover; border-radius:4px;" 
                     onerror="this.onerror=null; this.src='https://placehold.co/100x100?text=No+Img';">
            </td>
            <td class="align-middle">${tgl}</td>
            <td class="align-middle">${item.judul}</td>
            <td class="text-center align-middle">
                <div class="btn-group" role="group">
                    <button class="btn btn-sm btn-warning me-1" onclick="editBerita(${item.rowId})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteData('Berita', ${item.rowId})" title="Hapus">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>`;
    });

    tbody.innerHTML = html;
}

function renderPejabatTable(data) {
    const tbody = document.querySelector('#table-pejabat tbody');
    if(!tbody) return;
    let html = '';
    // Urutkan berdasarkan kategori: Kepala, Eselon IVA, Eselon V
    const kategoriOrder = { 'kepala': 1, 'eselon iva': 2, 'eselon v': 3 };
    const sorted = [...data].sort((a, b) => {
        const katA = (a.kategori || '').toLowerCase();
        const katB = (b.kategori || '').toLowerCase();
        const orderA = kategoriOrder[katA] || 99;
        const orderB = kategoriOrder[katB] || 99;
        if(orderA !== orderB) return orderA - orderB;
        return (a.rowId || 0) - (b.rowId || 0);
    });
    sorted.forEach(item => {
        let img = convertDriveToDirectLink(item.foto);
        html += `<tr>
            <td class="text-center">
                <img src="${img}" 
                     class="shadow-sm"
                     alt="${item.nama}"
                     style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; border: 1px solid #ddd;"
                     onerror="this.onerror=null; this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(item.nama)}&background=random&color=fff&size=128';">
            </td>
            <td>${item.nama}</td>
            <td>${item.jabatan}</td>
            <td>${item.kategori || '-'}</td>
            <td class="text-center">
                <button class="btn btn-sm btn-warning me-1" onclick="openEditPejabatModal(${item.rowId})"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-danger" onclick="deleteData('Pejabat', ${item.rowId})"><i class="fas fa-trash"></i></button>
            </td>
        </tr>`;
    });
    tbody.innerHTML = html || '<tr><td colspan="5" class="text-center py-3">Belum ada data.</td></tr>';
}

function renderPKBMStats(data) {
    const tTutor = document.getElementById('table-pkbm-tutor');
    const tSiswa = document.getElementById('table-pkbm-siswa');
    const tTutorTotal = document.getElementById('jumlah-tenaga-kependidikan-badge');
    
    if(!tTutor || !tSiswa) return;
    
    let h1='', h2='';
    let totalLaki = 0, totalPerempuan = 0, totalDiploma = 0, totalStrata = 0;
    
    // Total tetap dihitung dari seluruh data asli
    data.forEach(item => {
        totalLaki += Number(item.guru_laki) || 0;
        totalPerempuan += Number(item.guru_perempuan) || 0;
        totalDiploma += Number(item.guru_diploma) || 0;
        totalStrata += Number(item.guru_strata) || 0;
    });

    h1 = `<tr><td>${totalLaki}</td><td>${totalPerempuan}</td><td>${totalDiploma}</td><td>${totalStrata}</td><td><button class="btn btn-sm btn-outline-primary me-1" onclick="editPKBMStats('all')"><i class="fas fa-edit"></i></button></td></tr>`;

    if (tTutorTotal) tTutorTotal.textContent = totalLaki + totalPerempuan;

    // --- LOGIKA TABEL: SKIP DULU -> SORT DESC -> LIMIT 5 ---
    const skippedData = data.slice(1); 
    const sorted = skippedData
        .sort((a, b) => b.tahun - a.tahun) 
        .slice(0, 5); 

    sorted.forEach(item => {
        h2 += `<tr>
            <td class="fw-bold">${item.tahun}</td>
            <td>${item.siswa_a||0}</td>
            <td>${item.siswa_b||0}</td>
            <td>${item.siswa_c||0}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary me-1" onclick="editPKBMStats(${item.rowId})"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-danger" onclick="deleteData('PKBM', ${item.rowId})"><i class="fas fa-trash"></i></button>
            </td>
        </tr>`;
    });

    tTutor.innerHTML = h1;
    tSiswa.innerHTML = h2;

    // --- BAGIAN CHART (LIMIT 5 TAHUN TERBARU) ---
    const ctx = document.getElementById('chartPKBMSiswaLulusan');
    if (ctx) {
        // Ambil data, urutkan tahun terbaru, ambil 5, lalu balikkan lagi agar urutan tahun di grafik tetap naik (kiri ke kanan)
        const last5Years = [...data]
            .sort((a, b) => b.tahun - a.tahun)
            .slice(0, 5)
            .reverse();

        const labels = last5Years.map(item => item.tahun);
        const siswa = last5Years.map(item => (Number(item.siswa_a)||0) + (Number(item.siswa_b)||0) + (Number(item.siswa_c)||0));

        if (window.pkbmChart) window.pkbmChart.destroy();
        window.pkbmChart = new Chart(ctx.getContext('2d'), {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    { 
                        label: 'Jumlah Siswa', 
                        data: siswa, 
                        borderColor: '#0d6efd', 
                        backgroundColor: 'rgba(13,110,253,0.1)', 
                        tension: 0.3, 
                        fill: true 
                    }
                ]
            },
            options: { responsive: true, scales: { y: { beginAtZero: true } } },
            plugins: [ChartDataLabels]
        });
    }
}

function renderPKBMGallery(data) {
    const tbody = document.querySelector('#table-galeri-pkbm-list tbody');
    if(!tbody) return;
    let html = '';
    data.slice().reverse().forEach(item => {
        let img = convertDriveToDirectLink(item.gambar);
        html += `<tr><td><img src="${img}" style="width:50px;height:50px;object-fit:cover;border-radius:4px;" onerror="this.onerror=null; this.src='https://placehold.co/100x100?text=Img';"></td><td>${item.judul}</td><td class="text-center"><button class="btn btn-sm btn-warning me-1" onclick="openEditGaleriPKBMModal(${item.rowId})"><i class="fas fa-edit"></i></button><button class="btn btn-sm btn-danger" onclick="deleteData('galeri_pkbm', ${item.rowId})"><i class="fas fa-trash"></i></button></td></tr>`;
    });
    tbody.innerHTML = html;
}

function renderKlinikChart(klinik) {
    const ctx = document.getElementById('chartKlinikAdmin');
    if(!ctx) return;
    if(window.klinikChart) window.klinikChart.destroy();

    if(!Array.isArray(globalKlinikData) || globalKlinikData.length === 0) return;

    // --- LOGIKA: SKIP BARIS PERTAMA -> SORT DESC -> LIMIT 5 -> REVERSE ---
    const sorted = [...globalKlinikData]
        .slice(1) // 1. Skip baris pertama
        .sort((a, b) => (b.tahun || 0) - (a.tahun || 0)) // 2. Urutkan tahun terbaru di atas
        .slice(0, 5) // 3. Ambil 5 data teratas
        .reverse(); // 4. Balikkan agar grafik tampil dari tahun tertua ke terbaru

    const labels = sorted.map(item => item.tahun);
    const totals = sorted.map(item => {
        return ['stats_jan','stats_feb','stats_mar','stats_apr','stats_mei','stats_jun','stats_juli','stats_agust','stats_sep','stats_okt','stats_nov','stats_des']
            .map(k => parseInt(item[k]) || 0)
            .reduce((a, b) => a + b, 0);
    });

    window.klinikChart = new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Total Kunjungan per Tahun',
                data: totals,
                borderColor: '#198754',
                backgroundColor: 'rgba(25,135,84,0.1)',
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'top' },
                datalabels: {
                    anchor: 'end',
                    align: 'top',
                    color: '#333',
                    font: { weight: 'bold' },
                    formatter: function(value) { return value; }
                }
            },
            scales: { y: { beginAtZero: true } }
        },
        plugins: [ChartDataLabels]
    });
}

function renderKlinikTenagaTable(data) {
    const tbody = document.getElementById('table-klinik-tenaga');
    if (!tbody) return;
    let html = '';
    const item = Array.isArray(data) && data.length > 0 ? data[0] : null;
    if (item) {
        html = `<tr>
            <td>${item.medis_laki || 0}</td>
            <td>${item.medis_perempuan || 0}</td>
            <td>${item.profesi_dokter || 0}</td>
            <td>${item.profesi_perawat || 0}</td>
            <td>${item.ahli_gizi || 0}</td>
            <td>
                <button class="btn btn-sm btn-warning me-1" onclick="editKlinikTenaga('${item.rowId}')"><i class="fas fa-edit"></i></button>
            </td>
        </tr>`;
    } else {
        html = '<tr><td colspan="6" class="text-center py-3">Belum ada data.</td></tr>';
    }
    tbody.innerHTML = html;

    let totalMedis = 0;
    if (Array.isArray(data)) {
        data.forEach(item => {
            const laki = parseInt(item.medis_laki) || 0;
            const perempuan = parseInt(item.medis_perempuan) || 0;
            totalMedis += laki + perempuan;
        });
    }
    const badge = document.getElementById('jumlah-tenaga-medis-badge');
    if (badge) badge.textContent = totalMedis;
}

function renderKlinikKunjunganTable(data) {
    const tbody = document.getElementById('table-klinik-kunjungan');
    if (!tbody) return;
    
    let html = '';

    // --- ALUR LOGIKA: SKIP -> SORT DESC -> LIMIT 5 ---
    
    // 1. SKIP baris pertama dari urutan asli spreadsheet
    const skippedData = data.slice(1);

    // 2. SORT berdasarkan tahun secara Descending (Terbaru ke Terlama)
    // 3. SLICE untuk mengambil hanya 5 baris teratas hasil sortiran
    const latestData = skippedData
        .sort((a, b) => b.tahun - a.tahun)
        .slice(0, 5);

    latestData.forEach(item => {
        html += `<tr>
            <td class="fw-bold">${item.tahun || ''}</td>
            <td>${item.stats_jan || 0}</td>
            <td>${item.stats_feb || 0}</td>
            <td>${item.stats_mar || 0}</td>
            <td>${item.stats_apr || 0}</td>
            <td>${item.stats_mei || 0}</td>
            <td>${item.stats_jun || 0}</td>
            <td>${item.stats_juli || 0}</td>
            <td>${item.stats_agust || 0}</td>
            <td>${item.stats_sep || 0}</td>
            <td>${item.stats_okt || 0}</td>
            <td>${item.stats_nov || 0}</td>
            <td>${item.stats_des || 0}</td>
            <td>
                <button class="btn btn-sm btn-warning me-1" onclick="editKlinikKunjungan('${item.rowId}')"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-danger" onclick="deleteData('Klinik', '${item.rowId}')"><i class="fas fa-trash"></i></button>
            </td>
        </tr>`;
    });

    tbody.innerHTML = html || '<tr><td colspan="14" class="text-center py-3">Belum ada data.</td></tr>';
}
// Override renderKlinikTable agar memanggil dua fungsi di atas
function renderKlinikTable(data) {
    renderKlinikTenagaTable(data);
    renderKlinikKunjunganTable(data);
}

function renderGaleriKlinik(data) {
    globalGaleriKlinikData = data; // Simpan data ke variabel global
    const tbody = document.querySelector('#table-galeri-klinik-list tbody');
    if(!tbody) return;
    let html = '';
    data.slice().reverse().forEach(item => {
        let img = convertDriveToDirectLink(item.gambar);
        html += `<tr>
            <td><img src="${img}" style="width:50px;height:50px;object-fit:cover;border-radius:4px;" onerror="this.onerror=null; this.src='https://placehold.co/100x100?text=Img';"></td>
            <td>${item.judul}</td>
            <td class="text-center">
                <button class="btn btn-sm btn-warning me-1" onclick="openEditGaleriKlinikModal(${item.rowId})"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-danger" onclick="deleteData('galeri_klinik', ${item.rowId})"><i class="fas fa-trash"></i></button>
            </td>
        </tr>`;
    });
    tbody.innerHTML = html || '<tr><td colspan="3" class="text-center py-3">Belum ada data.</td></tr>';
}

// --- INFO PUBLIK (RENDER & EDIT) ---

function renderInfoPublikTable(data) {

    const tbody = document.querySelector('#table-infopublik tbody');
    if (!tbody) return;

    let html = '';

    data.slice().reverse().forEach((item, idx) => {

        let previewBtn = '-';

        if (item.link && item.link !== '-') {
            previewBtn = `
                <button class="btn btn-sm btn-info"
                    onclick="previewDokumen('${item.link}')">
                    <i class="fas fa-eye"></i>
                </button>
            `;
        }

        html += `
<tr>
    <td>${idx + 1}</td>
    <td>${item.kategori || '-'}</td>
    <td>
        <div class="fw-semibold">${item.judul || '-'}</div>
    </td>
    <td class="text-center">
        <div class="d-flex justify-content-center gap-1">
            ${previewBtn}
            <button class="btn btn-sm btn-warning"
                onclick="editInfoPublik(${item.rowId})">
                <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-danger"
                onclick="deleteData('InfoPublik', ${item.rowId})">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    </td>
</tr>
        `;
    });

    tbody.innerHTML = html || `
        <tr>
            <td colspan="4" class="text-center py-3">
                Belum ada data.
            </td>
        </tr>
    `;
}
window.previewDokumen = function(url) {
    if (!url) {
        alert("Link dokumen tidak ditemukan!");
        return;
    }
    const modalEl = document.getElementById('modal-preview-dokumen');
    const modalBody = document.getElementById('modal-preview-dokumen-body');
    let finalUrl = url;

    if (url.includes('drive.google.com') || url.includes('docs.google.com')) {
        let fileId = '';
        
        const matchD = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
        if (matchD && matchD[1]) {
            fileId = matchD[1];
        } 
        else {
            const matchId = url.match(/id=([a-zA-Z0-9_-]+)/);
            if (matchId && matchId[1]) {
                fileId = matchId[1];
            }
        }

        if (fileId) {
            finalUrl = `https://drive.google.com/file/d/${fileId}/preview`;
        }
    }

    console.log("Original URL:", url);
    console.log("Preview URL:", finalUrl);

    modalBody.innerHTML = `
        <iframe src="${finalUrl}" 
                width="100%" 
                style="height: 80vh; border: none; display: block; background: #fff;" 
                allow="autoplay">
        </iframe>`;

    if (typeof bootstrap !== 'undefined') {
        let myModal = bootstrap.Modal.getInstance(modalEl);
        if (!myModal) {
            myModal = new bootstrap.Modal(modalEl);
        }
        myModal.show();
    } else {
        $(modalEl).modal('show');
    }
    
    modalEl.addEventListener('hide.bs.modal', function () {
        modalBody.innerHTML = `
            <div class="d-flex justify-content-center align-items-center p-5">
                <div class="spinner-border text-primary" role="status"></div>
            </div>`;
    }, { once: true });
};
// --- FUNGSI EDIT & BUKA MODAL ---

window.openEditBannerModal = function(rowId) {
    const item = globalBannerData.find(x => x.rowId == rowId);
    if(!item) return;
    document.getElementById('edit-banner-rowId').value = item.rowId;
    document.getElementById('edit-banner-judul').value = item.judul;
    document.getElementById('edit-banner-deskripsi').value = item.deskripsi || '';
    if(document.getElementById('edit-banner-gambar')) document.getElementById('edit-banner-gambar').value = item.gambar || '';
    if(document.getElementById('edit-file-banner')) document.getElementById('edit-file-banner').value = '';
    if(modalEditBanner) modalEditBanner.show();
}

window.editBerita = function(rowId) {
    const item = globalBeritaData.find(x => x.rowId == rowId);
    if(!item) return;
    document.getElementById('edit-rowId').value = item.rowId;
    document.getElementById('edit-judul').value = item.judul;
    document.getElementById('edit-tanggal').value = item.tanggal ? new Date(item.tanggal).toISOString().split('T')[0] : '';
    document.getElementById('edit-ringkasan').value = item.ringkasan;
    document.getElementById('edit-isi').value = item.isi;
    if(document.getElementById('edit-gambar1')) document.getElementById('edit-gambar1').value = item.gambar1 || '';
    if(document.getElementById('edit-file-gambar1')) document.getElementById('edit-file-gambar1').value = '';
    if(modalEditBerita) modalEditBerita.show();
}

window.openEditGaleriPKBMModal = function(rowId) {
    const item = globalGaleriPKBMData.find(x => x.rowId == rowId);
    if(!item) return;
    document.getElementById('edit-pkbm-galeri-rowId').value = item.rowId;
    document.getElementById('edit-pkbm-galeri-judul').value = item.judul;
    document.getElementById('edit-pkbm-galeri-deskripsi').value = item.deskripsi;
    if(document.getElementById('edit-pkbm-galeri-gambar')) document.getElementById('edit-pkbm-galeri-gambar').value = item.gambar || '';
    if(document.getElementById('edit-file-pkbm-galeri')) document.getElementById('edit-file-pkbm-galeri').value = '';
    if(modalEditGaleri) modalEditGaleri.show();
}

window.openEditPejabatModal = function(rowId) {
    const item = globalPejabatData.find(x => x.rowId == rowId);
    if(!item) return;
    document.getElementById('edit-pejabat-rowId').value = item.rowId;
    document.getElementById('edit-pejabat-nama').value = item.nama;
    document.getElementById('edit-pejabat-jabatan').value = item.jabatan;
    // Set value dropdown kategori
    const kategoriSelect = document.getElementById('edit-pejabat-kategori');
    if (kategoriSelect) kategoriSelect.value = item.kategori || '';
    if(document.getElementById('edit-pejabat-gambar')) {
        document.getElementById('edit-pejabat-gambar').value = item.foto || '';
    }
    if(document.getElementById('edit-file-pejabat')) {
        document.getElementById('edit-file-pejabat').value = '';
    }
    if(modalEditPejabat) modalEditPejabat.show();
}

// Edit data klinik: tenaga medis saja
window.editKlinikTenaga = function(rowId) {
    const item = globalKlinikData.find(x => x.rowId == rowId);
    if(!item) return;
    document.getElementById('klinik-rowId').value = item.rowId;

    // Hanya isi field tenaga medis
    document.getElementById('klinik-medis-laki').value = item.medis_laki || '';
    document.getElementById('klinik-medis-perempuan').value = item.medis_perempuan || '';
    document.getElementById('klinik-dokter').value = item.profesi_dokter || '';
    document.getElementById('klinik-perawat').value = item.profesi_perawat || '';
    document.getElementById('klinik-gizi').value = item.ahli_gizi || '';
    document.getElementById('klinik-abh').value = item.jumlah_abh || '';

    // Kosongkan field kunjungan dan tahun
    document.getElementById('klinik-tahun').value = '';
    ['jan','feb','mar','apr','mei','jun','juli','agust','sep','okt','nov','des'].forEach(bulan => {
        document.getElementById('klinik-' + bulan).value = '';
    });

    document.getElementById('klinik-tahun').readOnly = true;
    document.getElementById('klinik-form-title').innerHTML = `Edit Data Tenaga Medis`;
    document.getElementById('klinik-mode-indicator').innerText = "Mode: Edit Tenaga Medis";
    const btn = document.getElementById('btn-save-klinik');
    btn.innerHTML = 'UPDATE DATA';
    btn.className = 'btn btn-warning btn-lg fw-bold px-5 shadow-sm';
    document.getElementById('btn-cancel-klinik').style.display = 'inline-block';

    document.getElementById('form-klinik').scrollIntoView({behavior: 'smooth'});
}

// Edit data klinik: kunjungan bulanan saja
window.editKlinikKunjungan = function(rowId) {
    const item = globalKlinikData.find(x => x.rowId == rowId);
    if(!item) return;
    document.getElementById('klinik-rowId').value = item.rowId;

    // Isi field kunjungan bulanan dan tahun
    document.getElementById('klinik-tahun').value = item.tahun || '';
    ['jan','feb','mar','apr','mei','jun','juli','agust','sep','okt','nov','des'].forEach(bulan => {
        document.getElementById('klinik-' + bulan).value = item['stats_' + bulan] || '';
    });

    // Kosongkan field tenaga medis
    document.getElementById('klinik-medis-laki').value = '';
    document.getElementById('klinik-medis-perempuan').value = '';
    document.getElementById('klinik-dokter').value = '';
    document.getElementById('klinik-perawat').value = '';
    document.getElementById('klinik-gizi').value = '';
    document.getElementById('klinik-abh').value = '';

    document.getElementById('klinik-tahun').readOnly = true;
    document.getElementById('klinik-form-title').innerHTML = `Edit Data Kunjungan Bulanan Tahun ${item.tahun || ''}`;
    document.getElementById('klinik-mode-indicator').innerText = "Mode: Edit Kunjungan Bulanan";
    const btn = document.getElementById('btn-save-klinik');
    btn.innerHTML = 'UPDATE DATA';
    btn.className = 'btn btn-warning btn-lg fw-bold px-5 shadow-sm';
    document.getElementById('btn-cancel-klinik').style.display = 'inline-block';

    document.getElementById('form-klinik').scrollIntoView({behavior: 'smooth'});
}

window.openEditGaleriKlinikModal = function(rowId) {
    const item = globalGaleriKlinikData.find(x => x.rowId == rowId);
    if(!item) return;
    document.getElementById('edit-galeri-klinik-rowId').value = item.rowId;
    document.getElementById('edit-galeri-klinik-judul').value = item.judul || '';
    document.getElementById('edit-galeri-klinik-deskripsi').value = item.deskripsi || '';
    if(document.getElementById('edit-url-galeri-klinik')) document.getElementById('edit-url-galeri-klinik').value = item.gambar || '';
    if(document.getElementById('edit-file-galeri-klinik')) document.getElementById('edit-file-galeri-klinik').value = '';
    document.getElementById('edit-btn-save-galeri-klinik').innerText = 'Update Galeri';
    document.getElementById('edit-btn-save-galeri-klinik').className = 'btn btn-warning w-100 fw-bold';
    document.getElementById('edit-btn-cancel-galeri-klinik').style.display = 'block';
    document.getElementById('edit-galeri-klinik-judul').focus();
    if (typeof modalEditGaleriKlinik !== 'undefined' && modalEditGaleriKlinik) {
        modalEditGaleriKlinik.show();
    }
}

window.resetEditGaleriKlinikForm = function() {
    document.getElementById('form-edit-galeri-klinik').reset();
    document.getElementById('edit-galeri-klinik-rowId').value = '';
    document.getElementById('edit-btn-save-galeri-klinik').innerText = 'Update Galeri';
    document.getElementById('edit-btn-save-galeri-klinik').className = 'btn btn-warning w-100 fw-bold';
    document.getElementById('edit-btn-cancel-galeri-klinik').style.display = 'none';
}

window.editPKBMStats = function(rowId) {
    // 1. Ambil referensi elemen utama
    const btnSave = document.getElementById('btn-save-pkbm');
    const btnCancel = document.getElementById('btn-cancel-pkbm');
    const formTitle = document.getElementById('pkbm-form-title');
    const modeIndicator = document.getElementById('mode-indicator');
    const inputTahun = document.getElementById('pkbm-tahun');
    const rowIdField = document.getElementById('pkbm-rowId');
    const formContainer = document.getElementById('form-pkbm');

    // Cek apakah elemen kritikal ada, jika tidak ada, stop fungsi agar tidak error
    if (!btnSave || !formContainer) {
        console.error("Gagal memuat form: Elemen 'btn-save-pkbm' atau 'form-pkbm' tidak ditemukan di HTML.");
        return;
    }

    // Fungsi pembantu untuk set value secara aman
    const setVal = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.value = val;
    };

    if (rowId === 'all') {
        let totalLaki = 0, totalPerempuan = 0, totalDiploma = 0, totalStrata = 0;
        
        globalPKBMData.forEach(item => {
            totalLaki += Number(item.guru_laki) || 0;
            totalPerempuan += Number(item.guru_perempuan) || 0;
            totalDiploma += Number(item.guru_diploma) || 0;
            totalStrata += Number(item.guru_strata) || 0;
        });

        setVal('pkbm-rowId', 'all');
        setVal('pkbm-tahun', '');
        inputTahun.readOnly = true;

        setVal('pkbm-guru_laki', totalLaki);
        setVal('pkbm-guru_perempuan', totalPerempuan);
        setVal('pkbm-guru_diploma', totalDiploma);
        setVal('pkbm-guru_strata', totalStrata);

        ['pkbm-siswa_a', 'pkbm-siswa_b', 'pkbm-siswa_c', 'pkbm-lulus_a', 'pkbm-lulus_b', 'pkbm-lulus_c'].forEach(id => setVal(id, ''));

        formTitle.innerHTML = `Edit Data Tenaga Pendidik (Total)`;
        modeIndicator.innerText = "Mode: Edit Total Tenaga Pendidik";

    } else {
        const item = globalPKBMData.find(x => x.rowId == rowId);
        if (!item) {
            Swal.fire('Error', 'Data tidak ditemukan.', 'error');
            return;
        }

        setVal('pkbm-rowId', item.rowId);
        setVal('pkbm-tahun', item.tahun);
        inputTahun.readOnly = true;

        ['pkbm-guru_laki', 'pkbm-guru_perempuan', 'pkbm-guru_diploma', 'pkbm-guru_strata'].forEach(id => setVal(id, ''));
        
        ['siswa_a', 'siswa_b', 'siswa_c', 'lulus_a', 'lulus_b', 'lulus_c'].forEach(key => {
            setVal('pkbm-' + key, item[key] || '');
        });

        formTitle.innerHTML = `Edit Data Siswa & Lulusan Tahun ${item.tahun}`;
        modeIndicator.innerText = "Mode: Edit Siswa & Lulusan";
    }

    // --- BAGIAN PENENTU TOMBOL MUNCUL ---
    btnSave.innerHTML = 'UPDATE DATA';
    btnSave.className = 'btn btn-warning btn-lg fw-bold px-5 shadow-sm';
    
    if (btnCancel) btnCancel.style.display = 'inline-block';
    
    // Pastikan container form tidak tersembunyi (jika menggunakan display:none sebelumnya)
    formContainer.style.display = 'block'; 
    formContainer.scrollIntoView({ behavior: 'smooth' });
};

window.resetPKBMForm = function() {
    document.getElementById('form-pkbm').reset();
    document.getElementById('pkbm-rowId').value = "";
    document.getElementById('pkbm-tahun').readOnly = false;
    document.getElementById('pkbm-tahun').classList.remove('bg-warning', 'bg-opacity-25');
    document.getElementById('pkbm-form-title').innerHTML = `<i class="fas fa-plus-circle me-2"></i>Input Data Statistik Baru`;
    document.getElementById('mode-indicator').innerText = "Mode: Input Baru";
    const btn = document.getElementById('btn-save-pkbm');
    btn.innerHTML = '<i class="fas fa-save me-2"></i>SIMPAN SEMUA DATA';
    btn.className = 'btn btn-primary btn-lg fw-bold px-5 shadow-sm';
    document.getElementById('btn-cancel-pkbm').style.display = 'none';
    ['pkbm-guru_laki','pkbm-guru_perempuan','pkbm-guru_diploma','pkbm-guru_strata','pkbm-siswa_a','pkbm-siswa_b','pkbm-siswa_c','pkbm-lulus_a','pkbm-lulus_b','pkbm-lulus_c'].forEach(id => {
        const el = document.getElementById(id);
        if(el) el.removeAttribute('required');
    });
}

window.resetKlinikForm = function() {
    const form = document.getElementById('form-klinik');
    if (form) form.reset();
    document.getElementById('klinik-rowId').value = "";
    document.getElementById('klinik-tahun').readOnly = false;
    document.getElementById('klinik-form-title').innerHTML = `<i class="fas fa-plus-circle me-2"></i>Input Data Klinik Baru`;
    document.getElementById('klinik-mode-indicator').innerText = "Mode: Input Baru";
    const btn = document.getElementById('btn-save-klinik');
    btn.innerHTML = '<i class="fas fa-save me-2"></i>SIMPAN SEMUA DATA';
    btn.className = 'btn btn-success btn-lg fw-bold px-5 shadow-sm';
    document.getElementById('btn-cancel-klinik').style.display = 'none';
}

window.editInfoPublik = function(rowId) {
    const item = globalInfoPublikData.find(x => x.rowId == rowId);
    if(!item) return;

    document.getElementById('edit-infopublik-rowId').value = item.rowId;
    document.getElementById('edit-infopublik-judul').value = item.judul || '';
    document.getElementById('edit-infopublik-deskripsi').value = item.deskripsi || '';
    document.getElementById('edit-url-infopublik').value = item.gambar || '';
    
    if (typeof item.link === 'object') {
        document.getElementById('edit-url-infopublik-pdf').value = JSON.stringify(item.link);
    } else {
        document.getElementById('edit-url-infopublik-pdf').value = item.link || '';
    }

    const select = document.getElementById('edit-kategori-infopublik');
    const custom = document.getElementById('edit-kategori-infopublik-custom');
    let found = false;
    for(let opt of select.options) {
        if(opt.value === item.kategori) {
            select.value = item.kategori;
            select.dispatchEvent(new Event('change'));
            found = true;
            break;
        }
    }
    if(!found) {
        select.value = '__lainnya__';
        select.dispatchEvent(new Event('change'));
        custom.value = item.kategori || '';
    }

    document.getElementById('edit-file-infopublik').value = '';
    document.getElementById('edit-file-infopublik-pdf').value = '';

    if(modalEditInfoPublik) modalEditInfoPublik.show();
}

window.editKunjungan = function(rowId) {
    const item = globalLayananKunjunganData.find(x => x.rowId == rowId);
    if (!item) {
        alert("Data tidak ditemukan");
        return;
    }

    document.getElementById('kunjungan-rowId').value = item.rowId;
    document.getElementById('kunjungan-jadwal').value = item.jadwal || '';
    document.getElementById('kunjungan-syarat').value = item.syarat || '';
    document.getElementById('kunjungan-himbauan').value = item.himbauan || '';
    document.getElementById('kunjungan-catatan').value = item.catatan || '';

    const titleEl = document.getElementById('modalKunjunganTitle');
    if(titleEl) titleEl.innerText = "Edit Jadwal Kunjungan";

    const modalEl = document.getElementById('modalKunjungan');
    if (typeof bootstrap !== 'undefined') {
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
    } else {
        $(modalEl).modal('show');
    }
};

window.showEditSOPModal = function() {
    let firstRowId = '';
    if (Array.isArray(globalLayananKunjunganData) && globalLayananKunjunganData.length > 0) {
        firstRowId = globalLayananKunjunganData[0].rowId;
    }

    if (!firstRowId) {
        alert("Data jadwal kunjungan kosong. Mohon buat minimal satu jadwal dulu agar bisa upload SOP.");
        return;
    }

    const modalEl = document.getElementById('modalEditSOP');
    const formEl = document.getElementById('form-edit-sop');

    if (formEl) {
        formEl.reset();
        document.getElementById('edit-sop-rowId').value = firstRowId; 
        document.getElementById('edit-file-sop').value = ''; 
    }

    if (typeof bootstrap !== 'undefined') {
        const modalInstance = new bootstrap.Modal(modalEl);
        modalInstance.show();
    } else {
        $(modalEl).modal('show');
    }
};

// --- VALIDASI FILE ---
function validateDocFile(input) {
    const file = input.files[0];
    if (!file) return;
    const validTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!validTypes.includes(file.type)) { alert("File harus berupa PDF, DOC, atau DOCX!"); input.value = ''; return false; }
    if (file.size > 50 * 1024 * 1024) { alert("Ukuran file maksimal 50MB!"); input.value = ''; return false; }
    return true;
}

document.getElementById('file-infopublik-pdf')?.addEventListener('change', function() { validateDocFile(this); });
document.getElementById('edit-file-infopublik-pdf')?.addEventListener('change', function() { validateDocFile(this); });

// --- UTILS DROPDOWN ---
function updateKategoriDropdown(data) {
    const select = document.getElementById('kategori-infopublik');
    const selectEdit = document.getElementById('edit-kategori-infopublik');
    const kategoriSet = new Set();
    data.forEach(item => { if(item.kategori) kategoriSet.add(item.kategori); });
    function fillDropdown(selectEl) {
        if(!selectEl) return;
        selectEl.innerHTML = '';
        kategoriSet.forEach(kat => {
            const opt = document.createElement('option');
            opt.value = kat; opt.textContent = kat; selectEl.appendChild(opt);
        });
        const optLain = document.createElement('option');
        optLain.value = '__lainnya__'; optLain.textContent = 'Lainnya...'; selectEl.appendChild(optLain);
    }
    fillDropdown(select);
    fillDropdown(selectEdit);
}

function handleKategoriChange(selectId, customId) {
    const select = document.getElementById(selectId);
    const custom = document.getElementById(customId);
    if(!select) return;
    select.addEventListener('change', function() {
        if(this.value === '__lainnya__') { custom.classList.remove('d-none'); custom.required = true; } 
        else { custom.classList.add('d-none'); custom.required = false; }
    });
}
handleKategoriChange('kategori-infopublik', 'kategori-infopublik-custom');
handleKategoriChange('edit-kategori-infopublik', 'edit-kategori-infopublik-custom');

document.getElementById('btn-kategori-custom')?.addEventListener('click', function() {
    document.getElementById('kategori-infopublik').value = '__lainnya__';
    document.getElementById('kategori-infopublik').dispatchEvent(new Event('change'));
});
document.getElementById('edit-btn-kategori-custom')?.addEventListener('click', function() {
    document.getElementById('edit-kategori-infopublik').value = '__lainnya__';
    document.getElementById('edit-kategori-infopublik').dispatchEvent(new Event('change'));
});

// --- LOGIKA UTAMA: KIRIM DATA (SEND DATA) ---
async function sendData(sheetName, formData, action = 'insert') {
    
    if(modalLoading) modalLoading.show();
    if(modalEditBerita) modalEditBerita.hide();
    if(modalEditGaleri) modalEditGaleri.hide();
    if(modalEditBanner) modalEditBanner.hide();
    if(modalEditPejabat) modalEditPejabat.hide();
    if(modalEditInfoPublik) modalEditInfoPublik.hide();

        // KHUSUS SOP: Kita cari manual karena variabelnya tidak global
    const modalSOP = document.getElementById('modalEditSOP');
    if (modalSOP && typeof bootstrap !== 'undefined') {
        const instance = bootstrap.Modal.getInstance(modalSOP);
        if (instance) instance.hide(); 
    }

    // 3. Buat Object Data dari FormData
    let object = {};
    formData.forEach((value, key) => {
        // Filter logika khusus PKBM
        if(sheetName === 'PKBM' && action === 'update' && value === '' && ['guru_laki','guru_perempuan','guru_diploma','guru_strata'].includes(key)) { return; }
        
        // Filter logika khusus Reintegrasi
        if(sheetName === 'Reintegrasi' && key === 'gambar' && typeof value === 'string' && value !== '' && !value.startsWith('{')) {
            object[key] = value;
        } else {
            object[key] = value;
        }
    });

    let filePromises = [];
    if (action !== 'delete') {
        if (sheetName === 'Berita') {
            if(action === 'insert') {
                filePromises.push(processFileField('file-berita-1', 'gambar1', object));
                filePromises.push(processFileField('file-berita-2', 'gambar2', object));
                filePromises.push(processFileField('file-berita-3', 'gambar3', object));
            } else {
                filePromises.push(processFileField('edit-file-gambar1', 'gambar1', object));
                filePromises.push(processFileField('edit-file-gambar2', 'gambar2', object));
                filePromises.push(processFileField('edit-file-gambar3', 'gambar3', object));
            }
        } 
        else if (sheetName === 'galeri_pkbm') {
            if(action === 'insert') filePromises.push(processFileField('file-galeri-pkbm', 'gambar', object));
            else filePromises.push(processFileField('edit-file-pkbm-galeri', 'gambar', object));
        }
        else if (sheetName === 'Banner') {
            if(action === 'insert') filePromises.push(processFileField('file-banner', 'gambar', object));
            else filePromises.push(processFileField('edit-file-banner', 'gambar', object));
        }
        else if (sheetName === 'InfoPublik') {
            if (action === 'insert') {
                filePromises.push(processFileField('file-infopublik', 'gambar', object));
                filePromises.push(processFileField('file-infopublik-pdf', 'link', object));
            } else {
                filePromises.push(processFileField('edit-file-infopublik', 'gambar', object));
                filePromises.push(processFileField('edit-file-infopublik-pdf', 'link', object));
            }
        }
        else if (sheetName === 'galeri_klinik') {
            if(action === 'insert') {
                filePromises.push(processFileField('file-galeri-klinik', 'gambar', object));
            } else {
                filePromises.push(processFileField('edit-file-galeri-klinik', 'gambar', object));
            }
        }
        else if (sheetName === 'Reintegrasi') {
            const fileInput = document.getElementById(action === 'insert' ? 'file-reintegrasi' : 'edit-file-reintegrasi');
            if (fileInput && fileInput.files && fileInput.files.length > 0) {
                filePromises.push(processFileField(fileInput.id, 'gambar', object));
            } else {
                if (typeof object.gambar === 'object' && object.gambar !== null && object.gambar.data) {
                    object.gambar = '';
                } else {
                    object.gambar = formData.get('gambar') || '';
                }
            }
        }
        else if (sheetName === 'Pejabat') {
            const isInsert = action === 'insert';
            const fileInputId = isInsert ? 'file-pejabat' : 'edit-file-pejabat';
            const fileInput = document.getElementById(fileInputId);
            
            if (fileInput && fileInput.files && fileInput.files.length > 0) {
                filePromises.push(processFileField(fileInputId, 'foto', object));
            } else {
                if (!isInsert) {
                    const oldUrlInput = document.getElementById('edit-pejabat-gambar');
                    object.foto = oldUrlInput ? oldUrlInput.value : '';
                } else {
                    object.foto = '';
                }
            }
            delete object.gambar;
        }
                // --- [FIX] BAGIAN KHUSUS SOP LAYANAN KUNJUNGAN ---
        else if (sheetName === 'LayananKunjungan') {
            if (action === 'update') {
                // Kita gunakan key 'url_sop' sesuai nama kolom di Spreadsheet
                filePromises.push(processFileField('edit-file-sop', 'url_sop', object));
                
                // Bersihkan key sampah dari form jika ada
                delete object.sop_url; 
            }
        }
    }

    await Promise.all(filePromises);

    const params = new URLSearchParams();
    params.append('sheet', sheetName);

    if(sheetName === 'PKBM' && object.rowId === 'all') { action = 'update'; params.append('row', 2); } 
    else { if(object.rowId) params.append('row', object.rowId); }
    params.append('action', action);
    params.append('data', JSON.stringify(object));

    try {
        const res = await fetch(API_URL, { method: 'POST', body: params });
        const json = await res.json();
        if(modalLoading) modalLoading.hide();
        if(json.status === 'success') {
                        if (modalSOP) {
                // Hapus class show dan style display manual untuk memaksa hilang
                modalSOP.classList.remove('show');
                modalSOP.style.display = 'none';
                // Hapus backdrop hitam jika masih ada
                const backdrops = document.querySelectorAll('.modal-backdrop');
                backdrops.forEach(b => b.remove());
                document.body.classList.remove('modal-open');
                document.body.style.overflow = ''; 
                document.body.style.paddingRight = '';
            }
            if(sheetName === 'PKBM') {
                resetPKBMForm();
            } else if(sheetName === 'Klinik') {
                resetKlinikForm();
            } else if(action === 'insert') {
                document.querySelectorAll('form').forEach(f => {
                    if(!f.id.includes('edit')) { f.reset(); f.querySelectorAll('input[type="file"]').forEach(i => i.value = ''); }
                });
            }
            showToast();
            await initDashboard(); 
        } else { alert("Gagal: " + json.message); }
    } catch (e) {
        if(modalLoading) modalLoading.hide();
        console.error(e);
        alert("Gagal Kirim/Upload. File mungkin terlalu besar (Max 50MB) atau koneksi terputus.");
    }
}

window.deleteData = function(sheetName, rowId) {
    if(confirm("Yakin ingin menghapus data ini?")) {
        let fd = new FormData();
        fd.append('rowId', rowId); 
        sendData(sheetName, fd, 'delete');
    }
}

function showToast() { const toastEl = document.getElementById('successToast'); if(toastEl) new bootstrap.Toast(toastEl).show(); }

// --- EVENT LISTENERS ---
document.getElementById('form-infopublik')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const select = document.getElementById('kategori-infopublik');
    const custom = document.getElementById('kategori-infopublik-custom');
    if(select && custom && select.value === '__lainnya__') {
        const input = document.createElement('input'); input.type = 'hidden'; input.name='kategori'; input.value = custom.value; this.appendChild(input); select.disabled = true;
    }
    sendData('InfoPublik', new FormData(this), 'insert');
    setTimeout(() => { if(select) select.disabled = false; }, 500);
});

document.getElementById('form-edit-infopublik')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const select = document.getElementById('edit-kategori-infopublik');
    const custom = document.getElementById('edit-kategori-infopublik-custom');
    if(select && custom && select.value === '__lainnya__') {
        const input = document.createElement('input'); input.type = 'hidden'; input.name='kategori'; input.value = custom.value; this.appendChild(input); select.disabled = true;
    }
    sendData('InfoPublik', new FormData(this), 'update');
    setTimeout(() => { if(select) select.disabled = false; }, 500);
});

document.getElementById('form-pejabat')?.addEventListener('submit', function(e) {
    e.preventDefault();
    sendData('Pejabat', new FormData(this), 'insert');
});

document.getElementById('form-edit-pejabat')?.addEventListener('submit', function(e) {
    e.preventDefault();
    sendData('Pejabat', new FormData(this), 'update');
});
document.getElementById('form-pkbm').addEventListener('submit', function(e){ e.preventDefault(); const id = document.getElementById('pkbm-rowId').value; sendData('PKBM', new FormData(this), id ? 'update' : 'insert'); });
document.getElementById('form-berita').addEventListener('submit', function(e){ e.preventDefault(); sendData('Berita', new FormData(this)); });
document.getElementById('form-edit-berita').addEventListener('submit', function(e){ e.preventDefault(); sendData('Berita', new FormData(this), 'update'); });
document.getElementById('form-galeri-pkbm').addEventListener('submit', function(e){ e.preventDefault(); sendData('galeri_pkbm', new FormData(this)); });
document.getElementById('form-edit-galeri-pkbm').addEventListener('submit', function(e) { e.preventDefault(); sendData('galeri_pkbm', new FormData(this), 'update'); });
document.getElementById('form-banner')?.addEventListener('submit', function(e) { e.preventDefault(); sendData('Banner', new FormData(this)); });
document.getElementById('form-edit-banner')?.addEventListener('submit', function(e) { e.preventDefault(); sendData('Banner', new FormData(this), 'update'); });
document.getElementById('form-klinik')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const rowId = document.getElementById('klinik-rowId').value;
    sendData('Klinik', new FormData(this), rowId ? 'update' : 'insert');
});
document.getElementById('form-galeri-klinik')?.addEventListener('submit', function(e) { e.preventDefault(); const id = document.getElementById('galeri-klinik-rowId').value; sendData('galeri_klinik', new FormData(this), id ? 'update' : 'insert'); });
document.getElementById('form-reintegrasi')?.addEventListener('submit', function(e) { e.preventDefault(); sendData('Reintegrasi', new FormData(this)); });
document.getElementById('form-edit-galeri-klinik')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const id = document.getElementById('edit-galeri-klinik-rowId').value;
    sendData('galeri_klinik', new FormData(this), id ? 'update' : 'insert');
    if (typeof modalEditGaleriKlinik !== 'undefined' && modalEditGaleriKlinik) {
        modalEditGaleriKlinik.hide();
    }
});
document.getElementById('form-edit-reintegrasi')?.addEventListener('submit', function(e) {
    e.preventDefault();
    sendData('Reintegrasi', new FormData(this), 'update');
    if (modalEditReintegrasi) modalEditReintegrasi.hide();
});

document.getElementById('form-edit-sop')?.addEventListener('submit', function(e) {
    e.preventDefault();

    const rowId = document.getElementById('edit-sop-rowId').value;
    const fileInput = document.getElementById('edit-file-sop');

    if (!rowId) {
        alert("Gagal: ID Data tidak ditemukan. Pastikan sudah ada data jadwal kunjungan.");
        return;
    }

    if (!fileInput.files || fileInput.files.length === 0) {
        alert("Silakan pilih file dokumen SOP (PDF) terlebih dahulu!");
        return;
    }
    
    sendData('LayananKunjungan', new FormData(this), 'update');
});

document.getElementById('url_sop')?.addEventListener('click', function(e) {
    e.preventDefault();
    let url = '';
    if (Array.isArray(globalLayananKunjunganData) && globalLayananKunjunganData.length > 0) {
        url = globalLayananKunjunganData[0].link || globalLayananKunjunganData[0].url_sop || '';
    }
    window.previewDokumen(url);
});



// --- RENDER REINTEGRASI ---
function renderReintegrasiTable(data) {
    const tbody = document.querySelector('#table-reintegrasi tbody');
    if (!tbody) return;
    let html = '';
    data.slice().reverse().forEach((item, idx) => {
        let img = convertDriveToDirectLink(item.gambar);
        html += `<tr>
            <td>${idx + 1}</td>
            <td>
                <img src="${img}" style="width:60px;height:40px;object-fit:cover;border-radius:4px;" 
                     onerror="this.onerror=null; this.src='https://placehold.co/100x100?text=Img';">
            </td>
            <td>
                <div class="fw-bold">${item.judul || '-'}</div>
                <div class="small text-muted">${item.deskripsi || ''}</div>
            </td>
            <td class="text-center">
                <button class="btn btn-sm btn-warning me-1" onclick="editReintegrasi(${item.rowId})"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-danger" onclick="deleteData('Reintegrasi', ${item.rowId})"><i class="fas fa-trash"></i></button>
            </td>
        </tr>`;
    });
    tbody.innerHTML = html || '<tr><td colspan="4" class="text-center py-3">Belum ada data.</td></tr>';
}

window.editReintegrasi = function(rowId) {
    const item = globalReintegrasiData.find(x => x.rowId == rowId);
    if (!item) return;
    document.getElementById('edit-reintegrasi-rowId').value = item.rowId;
    document.getElementById('edit-reintegrasi-judul').value = item.judul || '';
    document.getElementById('edit-reintegrasi-deskripsi').value = item.deskripsi || '';
    document.getElementById('edit-url-reintegrasi').value = item.gambar || '';
    document.getElementById('edit-file-reintegrasi').value = '';

    const imgPrev = document.getElementById('edit-preview-reintegrasi');
    if (imgPrev) {
        imgPrev.src = convertDriveToDirectLink(item.gambar || '');
        imgPrev.onerror = function() {
            this.onerror = null;
            this.src = 'https://placehold.co/100x100?text=Img';
        };
    }

    if (modalEditReintegrasi) modalEditReintegrasi.show();
}

document.getElementById('edit-file-reintegrasi')?.addEventListener('change', function() {
    const imgPrev = document.getElementById('edit-preview-reintegrasi');
    if (this.files && this.files[0] && imgPrev) {
        const reader = new FileReader();
        reader.onload = function(e) {
            imgPrev.src = e.target.result;
        };
        reader.readAsDataURL(this.files[0]);
    }
});

document.getElementById('form-kunjungan')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    sendData('LayananKunjungan', new FormData(this), 'update');
    
    const modalEl = document.getElementById('modalKunjungan');
    if (modalEl && typeof bootstrap !== 'undefined') {
        const instance = bootstrap.Modal.getInstance(modalEl);
        if (instance) instance.hide();
    }
});



