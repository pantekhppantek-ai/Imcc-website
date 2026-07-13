// Firebase Realtime SDK Integrations and Core logic
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getDatabase, ref, set, push, onValue, remove, update, get } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-database.js";

// ============================================
// CONFIGURATION
// ============================================

// Firebase Configuration (User's Project)
const firebaseConfig = {
    apiKey: "AIzaSyBtez3wEJtbrMjILJOXYYyB7yDlls5ZoJI",
    authDomain: "imcc-2a157.firebaseapp.com",
    databaseURL: "https://imcc-2a157-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "imcc-2a157",
    storageBucket: "imcc-2a157.firebasestorage.app",
    messagingSenderId: "19282805089",
    appId: "1:19282805089:web:bbfea08d6fcb9317748520",
    measurementId: "G-623YHMXQKR"
};

// Image Upload Configuration
const API_KEY = "d5e26445eef0f536e1e7427b71e7a9174288b17871141a6ee9fbb1477a173de7";
const API_URL = "https://api-v1-t2-upload.urusai.cc";

// Admin Token (Ganti dengan token rahasia Anda)
const ADMIN_TOKEN = "imcc2026_99887766";

// ============================================
// SOCIAL MEDIA CONFIGURATION (KONFIGURASI IKON)
// ============================================

// Konfigurasi standar untuk semua platform sosial media
const SOCIAL_PLATFORMS = [
    {
        key: 'youtube',
        iconClass: 'fa-brands fa-youtube',
        color: 'red',
        bgColor: 'red',
        label: 'YouTube',
        textColor: 'text-red-500'
    },
    {
        key: 'tiktok',
        iconClass: 'fa-brands fa-tiktok',
        color: 'pink',
        bgColor: 'pink',
        label: 'TikTok',
        textColor: 'text-pink-400'
    },
    {
        key: 'telegram',
        iconClass: 'fa-brands fa-telegram',
        color: 'sky',
        bgColor: 'sky',
        label: 'Telegram',
        textColor: 'text-sky-400'
    },
    {
        key: 'discord',
        iconClass: 'fa-brands fa-discord',
        color: 'indigo',
        bgColor: 'indigo',
        label: 'Discord',
        textColor: 'text-indigo-400'
    },
    {
        key: 'instagram',
        iconClass: 'fa-brands fa-instagram',
        color: 'pink',
        bgColor: 'pink',
        label: 'Instagram',
        textColor: 'text-pink-400'
    },
    {
        key: 'github',
        iconClass: 'fa-brands fa-github',
        color: 'gray',
        bgColor: 'gray',
        label: 'GitHub',
        textColor: 'text-gray-400'
    },
    {
        key: 'whatsapp',
        iconClass: 'fa-brands fa-whatsapp',
        color: 'emerald',
        bgColor: 'emerald',
        label: 'WhatsApp Channel',
        textColor: 'text-emerald-500'
    },
    {
        key: 'donate',
        iconClass: 'fa-solid fa-hand-holding-dollar', // PERBAIKAN: Menggunakan fa-solid bukan fa-brands
        color: 'emeraldGlow',
        bgColor: 'emerald',
        label: 'Dukungan / Donate',
        textColor: 'text-emeraldGlow',
        isSolid: true // Flag untuk menandai ini ikon solid
    },
    {
        key: 'facebook',
        iconClass: 'fa-brands fa-facebook', // PERBAIKAN: Konsisten menggunakan fa-facebook
        color: 'blue',
        bgColor: 'blue',
        label: 'Facebook',
        textColor: 'text-blue-500'
    }
];

// ============================================
// GLOBAL STATE
// ============================================

let app, auth, db;
let currentUserUID = null;
let isAdmin = false;
let targetInputId = null;
let creatorsList = [];
let registrationsList = [];

// ============================================
// INITIALIZATION
// ============================================

// Initialize Firebase
app = initializeApp(firebaseConfig);
auth = getAuth(app);
db = getDatabase(app);

// Sign in anonymously to enable secure DB writes
signInAnonymously(auth)
    .then((userCredential) => {
        currentUserUID = userCredential.user.uid;
        console.log("✅ Terhubung ke Firebase secara Anonim. UID:", currentUserUID);
        
        // Initialize admin structure
        initializeAdminStructure().then(() => {
            // Check admin status after initialization
            checkAdminStatus();
        });
        
        // Check session storage for admin status
        const storedAdminStatus = sessionStorage.getItem('isAdmin');
        if (storedAdminStatus === 'true') {
            showAdminUI();
        }
    })
    .catch((err) => {
        console.warn("Firebase Auth Error: Mengakses Database tanpa auth...", err);
        // Still try to initialize even if auth fails
        initializeAdminStructure();
    });

// ============================================
// ADMIN ROLE MANAGEMENT
// ============================================

/**
 * Initialize admin structure in Firebase if not exists
 */
async function initializeAdminStructure() {
    const adminsRef = ref(db, 'admins');
    const snapshot = await get(adminsRef);
    if (!snapshot.exists()) {
        console.log('ℹ️  Struktur admin belum ada. Silakan tambahkan UID user di path /admins/{uid} dengan value true via Firebase Console.');
        console.log('📝 Contoh: /admins/abc123xyz = true');
    }
}

/**
 * Check if current user is admin based on UID in Firebase
 */
async function checkAdminStatus() {
    if (!currentUserUID) return false;
    
    try {
        const adminRef = ref(db, `admins/${currentUserUID}`);
        const snapshot = await get(adminRef);
        const hasAdminAccess = snapshot.exists() && snapshot.val() === true;
        
        if (hasAdminAccess) {
            console.log('✅ User adalah admin!');
            showAdminUI();
        } else {
            console.log('ℹ️  User bukan admin.');
        }
        
        return hasAdminAccess;
    } catch (error) {
        console.error('Gagal mengecek status admin:', error);
        return false;
    }
}

/**
 * Show admin UI elements
 */
function showAdminUI() {
    isAdmin = true;
    
    // Show all elements with admin-only class
    document.querySelectorAll('.admin-only').forEach(el => {
        if (el.tagName === 'A' && el.classList.contains('nav-pill')) {
            el.classList.add('visible');
        } else if (el.tagName === 'A' && el.classList.contains('mobile-nav-pill')) {
            el.classList.add('visible');
        } else if (el.tagName === 'LI') {
            el.style.display = 'list-item';
        } else {
            el.style.display = 'flex';
        }
    });
    
    // Update session storage
    sessionStorage.setItem('isAdmin', 'true');
}

/**
 * Hide admin UI elements
 */
function hideAdminUI() {
    isAdmin = false;
    
    document.querySelectorAll('.admin-only').forEach(el => {
        el.style.display = 'none';
        el.classList.remove('visible', 'inline-visible');
    });
    
    sessionStorage.setItem('isAdmin', 'false');
}

// ============================================
// TOKEN AUTHENTICATION SYSTEM
// ============================================

/**
 * Show token login modal
 */
function showTokenModal() {
    const modal = document.getElementById('tokenModal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.getElementById('tokenInput').value = '';
    document.getElementById('tokenError').classList.add('hidden');
    document.getElementById('tokenInput').focus();
}

/**
 * Hide token login modal
 */
function hideTokenModal() {
    const modal = document.getElementById('tokenModal');
    modal.classList.remove('flex');
    modal.classList.add('hidden');
}

/**
 * Handle token submission
 */
function handleTokenSubmit() {
    const tokenInput = document.getElementById('tokenInput');
    const tokenError = document.getElementById('tokenError');
    const enteredToken = tokenInput.value.trim();
    
    if (enteredToken === ADMIN_TOKEN) {
        // Token valid
        showAdminUI();
        hideTokenModal();
        alertNotification('success', 'Token valid! Anda sekarang memiliki akses admin.');
        window.location.hash = 'admin';
    } else {
        // Token invalid
        tokenError.classList.remove('hidden');
        tokenInput.value = '';
        tokenInput.focus();
    }
}

/**
 * Handle admin navigation with token check
 */
function handleAdminNavigation(targetHash) {
    if (targetHash === 'admin') {
        if (isAdmin) {
            // Already authenticated, allow access
            return true;
        } else {
            // Not authenticated, show token modal
            showTokenModal();
            return false;
        }
    }
    return true;
}

// ============================================
// HELPER FUNCTION: Membangun HTML Sosial Media
// ============================================

/**
 * Membangun HTML untuk ikon sosial media di kartu creator
 * @param {Object} socials - Objek sosial media dari creator
 * @returns {string} HTML string untuk ikon sosial media
 */
function buildSocialIconsHTML(socials) {
    if (!socials) return '<span class="text-[10px] text-gray-600 italic">Tidak ada tautan sosial</span>';
    
    let html = '';
    
    SOCIAL_PLATFORMS.forEach(platform => {
        if (socials[platform.key]) {
            html += `
                <a href="${socials[platform.key]}" 
                   target="_blank" 
                   class="w-8 h-8 rounded-lg bg-${platform.bgColor}-600/10 hover:bg-${platform.bgColor}-600/30 border border-${platform.color}-500/20 flex items-center justify-center ${platform.textColor} hover:text-white transition-all text-sm" 
                   title="${platform.label}">
                    <i class="${platform.iconClass}"></i>
                </a>`;
        }
    });
    
    return html || '<span class="text-[10px] text-gray-600 italic">Tidak ada tautan sosial</span>';
}

/**
 * Membangun HTML untuk ikon sosial media di tabel admin
 * @param {Object} socials - Objek sosial media dari creator
 * @returns {string} HTML string untuk ikon sosial media
 */
function buildAdminSocialIconsHTML(socials) {
    if (!socials) return '<span class="text-gray-600">None</span>';
    
    let html = '';
    
    SOCIAL_PLATFORMS.forEach(platform => {
        if (socials[platform.key]) {
            html += `<i class="${platform.iconClass} ${platform.textColor}" title="${platform.label}"></i> `;
        }
    });
    
    return html.trim() || '<span class="text-gray-600">None</span>';
}

// ============================================
// UPLOAD MODAL FUNCTIONS
// ============================================

window.openUploadModal = function(inputId) {
    targetInputId = inputId;
    const modal = document.getElementById('uploadModal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    
    // Reset upload states
    document.getElementById('uploadProgressContainer').classList.add('hidden');
    document.getElementById('uploadResult').classList.add('hidden');
    document.getElementById('uploadPreview').classList.add('hidden');
    document.getElementById('uploadPlaceholder').classList.remove('hidden');
    document.getElementById('fileInput').value = '';
};

window.closeUploadModal = function() {
    const modal = document.getElementById('uploadModal');
    modal.classList.remove('flex');
    modal.classList.add('hidden');
    targetInputId = null;
};

// File Select Handler
window.handleFileSelect = function(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Preview image
    const reader = new FileReader();
    reader.onload = function(e) {
        const preview = document.getElementById('uploadPreview');
        const placeholder = document.getElementById('uploadPlaceholder');
        preview.src = e.target.result;
        preview.classList.remove('hidden');
        placeholder.classList.add('hidden');
    };
    reader.readAsDataURL(file);

    // Auto upload
    uploadImage(file);
};

// Upload Image Function
async function uploadImage(file) {
    const progressContainer = document.getElementById('uploadProgressContainer');
    const progressBar = document.getElementById('uploadProgressBar');
    const uploadStatus = document.getElementById('uploadStatus');
    const uploadResult = document.getElementById('uploadResult');
    const uploadedUrl = document.getElementById('uploadedUrl');

    progressContainer.classList.remove('hidden');
    uploadResult.classList.add('hidden');

    // Simulate progress
    let progress = 0;
    const progressInterval = setInterval(() => {
        if (progress < 90) {
            progress += Math.random() * 15;
            if (progress > 90) progress = 90;
            progressBar.style.width = progress + '%';
        }
    }, 200);

    uploadStatus.textContent = 'Mengupload...';

    const formData = new FormData();
    formData.append('file', file);
    formData.append('r18', '0');
    formData.append('token', API_KEY);
    formData.append('sha256', '');

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            body: formData
        });

        clearInterval(progressInterval);
        progressBar.style.width = '100%';

        if (!response.ok) {
            throw new Error('Upload gagal: ' + response.statusText);
        }

        const data = await response.json();
        
        if (data.status === 'success' && data.data && data.data.url_direct) {
            uploadedUrl.value = data.data.url_direct;
            uploadStatus.textContent = 'Upload berhasil!';
            uploadResult.classList.remove('hidden');
            progressContainer.classList.add('hidden');
            
            alertNotification('success', 'Foto berhasil diupload! URL siap digunakan.');
        } else {
            throw new Error('Response tidak valid dari server');
        }
    } catch (error) {
        clearInterval(progressInterval);
        progressBar.style.width = '0%';
        uploadStatus.textContent = 'Gagal: ' + error.message;
        progressContainer.classList.add('hidden');
        
        alertNotification('error', 'Gagal mengupload foto: ' + error.message);
    }
}

// Copy URL to clipboard
window.copyUploadedUrl = function() {
    const uploadedUrl = document.getElementById('uploadedUrl');
    uploadedUrl.select();
    document.execCommand('copy');
    alertNotification('success', 'URL berhasil disalin ke clipboard!');
};

// ============================================
// REALTIME SYNCHRONIZERS
// ============================================

onValue(ref(db, 'creators'), (snapshot) => {
    const data = snapshot.val();
    
    creatorsList = [];
    if (data) {
        for (let key in data) {
            creatorsList.push({
                firebaseKey: key,
                ...data[key]
            });
        }
    }
    renderCreators();
    renderAdminCreators();
    updateStatsCounter();
});

onValue(ref(db, 'registrations'), (snapshot) => {
    const data = snapshot.val();
    registrationsList = [];
    if (data) {
        for (let key in data) {
            registrationsList.push({
                firebaseKey: key,
                ...data[key]
            });
        }
    }
    renderAdminRegistrations();
});

// Listen for changes to admin status in Firebase
if (currentUserUID) {
    onValue(ref(db, `admins/${currentUserUID}`), (snapshot) => {
        if (snapshot.exists() && snapshot.val() === true) {
            showAdminUI();
        } else {
            hideAdminUI();
        }
        updateActivePage();
    });
}

// ============================================
// UI RENDER FUNCTIONS
// ============================================

function updateStatsCounter() {
    const counter = document.getElementById('stats-count');
    if (counter) {
        counter.innerText = creatorsList.length;
    }
    const adminCounter = document.getElementById('adminStatsCount');
    if (adminCounter) {
        adminCounter.innerText = creatorsList.length;
    }
}

function renderCreators() {
    const grid = document.getElementById('creatorsGrid');
    if (!grid) return;

    grid.innerHTML = '';

    if (creatorsList.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full text-center py-20 bg-white/[0.01] border border-dashed border-white/10 rounded-3xl">
                <i class="fa-regular fa-folder-open text-gray-600 text-5xl mb-4"></i>
                <h3 class="text-lg font-bold text-gray-400">Belum ada creator terdaftar</h3>
                <p class="text-gray-500 text-xs mt-2">Creator akan muncul di sini setelah ditambahkan melalui Panel Admin.</p>
            </div>
        `;
        return;
    }

    creatorsList.forEach(creator => {
        // Gunakan helper function untuk membangun HTML sosial media
        const socialsHTML = buildSocialIconsHTML(creator.socials);
        
        const avatarImg = creator.avatar || 'https://placehold.co/120x120/141923/ffffff?text=' + creator.name.substring(0, 2).toUpperCase();

        const cardHTML = `
            <div class="creator-card glass-panel rounded-3xl overflow-hidden border border-white/5 transition-all duration-300 select-none" data-name="${creator.name}">
                <div class="h-28 w-full relative">
                    <img src="https://i.urusai.cc/HlvoE.jpg" class="w-full h-full object-cover object-top absolute inset-0" alt="Minecraft Banner">
                    <div class="absolute inset-0 bg-gradient-to-t from-mineDark-950/90 via-mineDark-950/20 to-transparent"></div>
                </div>
                <div class="relative px-6 -mt-10 z-10 flex justify-between items-end">
                    <div class="w-20 h-20 rounded-2xl bg-mineDark-950 p-[3px] shadow-2xl border-2 border-white/10 overflow-hidden">
                        <img src="${avatarImg}" onerror="this.src='https://placehold.co/120x120/141923/ffffff?text=MC'" alt="${creator.name}" class="w-full h-full rounded-2xl object-cover">
                    </div>
                    <span class="text-[9px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full whitespace-nowrap mb-1 bg-diamond/10 text-diamond border border-diamond/20">Creator</span>
                </div>
                <div class="pt-4 px-6 pb-6 relative">
                    <div>
                        <h3 class="text-lg font-bold text-white">${creator.name}</h3>
                        <p class="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mt-0.5">Minecraft Creator</p>
                    </div>
                    <p class="text-gray-400 text-xs mt-4 leading-relaxed h-16 overflow-y-auto pr-1">
                        ${creator.bio}
                    </p>
                    <div class="flex flex-wrap items-center gap-2 mt-5 py-3 border-t border-white/5">
                        ${socialsHTML}
                    </div>
                </div>
            </div>
        `;
        grid.insertAdjacentHTML('beforeend', cardHTML);
    });

    filterCreators();
}

function renderAdminRegistrations() {
    const list = document.getElementById('pendingRegistrationsList');
    if (!list) return;

    list.innerHTML = '';

    if (registrationsList.length === 0) {
        list.innerHTML = `
            <div class="text-center py-12 bg-white/[0.01] border border-dashed border-white/5 rounded-2xl">
                <i class="fa-solid fa-circle-check text-gray-600 text-3xl mb-3"></i>
                <p class="text-xs text-gray-500 font-bold uppercase">Antrean Bersih</p>
                <p class="text-[10px] text-gray-600 mt-1">Tidak ada pengajuan pendaftaran baru.</p>
            </div>
        `;
        return;
    }

    registrationsList.forEach((reg, index) => {
        const avatarIcon = reg.avatarUrl ?
            `<img src="${reg.avatarUrl}" class="w-8 h-8 rounded-full object-cover border border-white/20 mr-2" />` :
            '';
        const itemHTML = `
            <div class="glass-panel p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-all space-y-3 relative overflow-hidden">
                <div class="absolute right-0 top-0 text-[50px] font-bold text-white/[0.02] font-mono pointer-events-none select-none">
                    #${index + 1}
                </div>
                <div class="flex justify-between items-start">
                    <div class="flex items-center">
                        ${avatarIcon}
                        <div>
                            <h4 class="text-sm font-bold text-white font-mono">${reg.name}</h4>
                            <p class="text-[10px] text-emeraldGlow font-bold mt-0.5"><i class="fa-solid fa-square-phone mr-1"></i>${reg.phone}</p>
                        </div>
                    </div>
                    <span class="text-[8px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-diamond/10 text-diamond border border-diamond/20">
                        Creator
                    </span>
                </div>
                <p class="text-[11px] text-gray-400 bg-mineDark-950 p-3 rounded-lg border border-white/[0.02]">
                    ${reg.details || '<span class="text-gray-600 italic">Tanpa info detail opsional</span>'}
                </p>
                <div class="flex gap-2 pt-1">
                    <button onclick="approveRegistration('${reg.firebaseKey}')" class="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black text-[10px] font-extrabold rounded-lg tracking-wider transition-colors uppercase font-mono">
                        <i class="fa-solid fa-check mr-1"></i> Terima
                    </button>
                    <button onclick="rejectRegistration('${reg.firebaseKey}')" class="px-4 py-1.5 bg-red-500/10 hover:bg-red-500/30 border border-red-500/30 text-red-400 hover:text-white text-[10px] font-bold rounded-lg tracking-wider transition-colors uppercase font-mono">
                        <i class="fa-solid fa-trash mr-1"></i> Tolak
                    </button>
                </div>
            </div>
        `;
        list.insertAdjacentHTML('beforeend', itemHTML);
    });
}

function renderAdminCreators() {
    const tableBody = document.getElementById('adminCreatorsTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    if (creatorsList.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" class="py-8 text-center text-gray-500 italic">Tidak ada creator terdaftar di database.</td>
            </tr>
        `;
        return;
    }

    creatorsList.forEach(creator => {
        const avatarImg = creator.avatar || 'https://placehold.co/120x120/141923/ffffff?text=' + creator.name.substring(0, 2).toUpperCase();

        // Gunakan helper function untuk membangun HTML ikon sosial media
        const platformsHTML = buildAdminSocialIconsHTML(creator.socials);

        const rowHTML = `
            <tr class="hover:bg-white/[0.02] transition-colors border-b border-white/5">
                <td class="py-3 pl-2 flex items-center gap-3">
                    <img src="${avatarImg}" onerror="this.src='https://placehold.co/120x120/141923/ffffff?text=MC'" class="w-8 h-8 rounded-xl object-cover border border-white/10" />
                    <div>
                        <h4 class="font-bold text-white font-mono">${creator.name}</h4>
                        <span class="text-[8px] bg-diamond/10 text-diamond border border-diamond/20 px-1.5 py-0.5 rounded">Creator</span>
                    </div>
                </td>
                <td class="py-3 hidden md:table-cell text-gray-400 max-w-xs truncate" title="${creator.bio}">
                    ${creator.bio}
                </td>
                <td class="py-3 hidden sm:table-cell">
                    <div class="flex items-center gap-2 text-sm">
                        ${platformsHTML}
                    </div>
                </td>
                <td class="py-3 text-right pr-2">
                    <div class="flex items-center justify-end gap-2">
                        <button onclick="openEditModal('${creator.firebaseKey}')" class="px-2.5 py-1 border border-diamond/30 hover:border-diamond bg-diamond/5 hover:bg-diamond/10 text-diamond text-[10px] font-bold rounded-lg transition-colors">
                            <i class="fa-solid fa-user-gear"></i> Edit
                        </button>
                        <button onclick="deleteCreator('${creator.firebaseKey}')" class="px-2.5 py-1 border border-red-500/30 hover:border-red-500 bg-red-500/5 hover:bg-red-500/10 text-red-400 hover:text-white text-[10px] font-bold rounded-lg transition-colors">
                            <i class="fa-solid fa-trash-can"></i> Hapus
                        </button>
                    </div>
                </td>
            </tr>
        `;
        tableBody.insertAdjacentHTML('beforeend', rowHTML);
    });
}

// ============================================
// DATA MUTATION FUNCTIONS
// ============================================

function deleteCreator(firebaseKey) {
    const creator = creatorsList.find(c => c.firebaseKey === firebaseKey);
    if (!creator) return;

    remove(ref(db, 'creators/' + firebaseKey))
        .then(() => {
            alertNotification('error', `Creator "${creator.name}" telah dihapus secara live.`);
        })
        .catch((err) => {
            alertNotification('error', `Gagal menghapus creator: ${err.message}`);
        });
}

function openEditModal(firebaseKey) {
    const creator = creatorsList.find(c => c.firebaseKey === firebaseKey);
    if (!creator) return;

    document.getElementById('editKey').value = firebaseKey;
    document.getElementById('editName').value = creator.name || '';
    document.getElementById('editAvatar').value = creator.avatar || '';
    document.getElementById('editBio').value = creator.bio || '';

    const socials = creator.socials || {};
    document.getElementById('editYoutube').value = socials.youtube || '';
    document.getElementById('editTiktok').value = socials.tiktok || '';
    document.getElementById('editTelegram').value = socials.telegram || '';
    document.getElementById('editDiscord').value = socials.discord || '';
    document.getElementById('editInstagram').value = socials.instagram || '';
    document.getElementById('editGithub').value = socials.github || '';
    document.getElementById('editWhatsapp').value = socials.whatsapp || '';
    document.getElementById('editDonate').value = socials.donate || '';
    document.getElementById('editFacebook').value = socials.facebook || '';

    const modal = document.getElementById('editModal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeEditModal() {
    const modal = document.getElementById('editModal');
    modal.classList.remove('flex');
    modal.classList.add('hidden');
    document.getElementById('editCreatorForm').reset();
}

function handleEditCreatorSubmit(event) {
    event.preventDefault();
    const firebaseKey = document.getElementById('editKey').value;
    if (!firebaseKey) return;

    const updatedData = {
        name: document.getElementById('editName').value.trim(),
        avatar: document.getElementById('editAvatar').value.trim() ||
            `https://placehold.co/120x120/141923/00F5FF?text=${document.getElementById('editName').value.substring(0,2).toUpperCase()}`,
        bio: document.getElementById('editBio').value.trim(),
        socials: {
            youtube: document.getElementById('editYoutube').value.trim(),
            tiktok: document.getElementById('editTiktok').value.trim(),
            telegram: document.getElementById('editTelegram').value.trim(),
            discord: document.getElementById('editDiscord').value.trim(),
            instagram: document.getElementById('editInstagram').value.trim(),
            github: document.getElementById('editGithub').value.trim(),
            whatsapp: document.getElementById('editWhatsapp').value.trim(),
            donate: document.getElementById('editDonate').value.trim(),
            facebook: document.getElementById('editFacebook').value.trim()
        }
    };

    update(ref(db, 'creators/' + firebaseKey), updatedData)
        .then(() => {
            alertNotification('success', `Profil "${updatedData.name}" berhasil diperbarui secara live.`);
            closeEditModal();
        })
        .catch((err) => {
            alertNotification('error', `Gagal memperbarui profil: ${err.message}`);
        });
}

function handleFormSubmit(event) {
    event.preventDefault();
    const fullName = document.getElementById('fullName').value.trim();
    const phoneNumber = document.getElementById('phoneNumber').value.trim();
    const avatarUrl = document.getElementById('avatarUrl').value.trim();
    const optionalDetails = document.getElementById('optionalDetails').value.trim();

    const newRegistration = {
        id: "reg_" + Date.now(),
        name: fullName,
        phone: phoneNumber,
        role: "creator",
        avatarUrl: avatarUrl,
        socials: {
            youtube: document.getElementById('joinYoutube').value.trim(),
            tiktok: document.getElementById('joinTiktok').value.trim(),
            telegram: document.getElementById('joinTelegram').value.trim(),
            discord: document.getElementById('joinDiscord').value.trim(),
            instagram: document.getElementById('joinInstagram').value.trim(),
            github: document.getElementById('joinGithub').value.trim(),
            whatsapp: document.getElementById('joinWhatsapp').value.trim(),
            donate: document.getElementById('joinDonate').value.trim(),
            facebook: document.getElementById('joinFacebook').value.trim()
        },
        details: optionalDetails
    };

    push(ref(db, 'registrations'), newRegistration)
        .then(() => {
            alertNotification('success',
                `Terima kasih ${fullName}! Pendaftaran Anda berhasil dikirim secara realtime.`);
            document.getElementById('imccJoinForm').reset();
        })
        .catch((err) => {
            alertNotification('error', `Gagal mengirim pendaftaran: ${err.message}`);
        });
}

function handleDirectCreatorUpload(event) {
    event.preventDefault();
    const name = document.getElementById('adminName').value.trim();
    const bio = document.getElementById('adminBio').value.trim();
    let avatar = document.getElementById('adminAvatar').value.trim();

    if (!avatar) {
        avatar = `https://placehold.co/120x120/141923/00F5FF?text=${name.substring(0,2).toUpperCase()}`;
    }

    const newCreator = {
        id: "cre_" + Date.now(),
        name: name,
        role: "creator",
        bio: bio,
        avatar: avatar,
        socials: {
            youtube: document.getElementById('adminYoutube').value.trim(),
            tiktok: document.getElementById('adminTiktok').value.trim(),
            telegram: document.getElementById('adminTelegram').value.trim(),
            discord: document.getElementById('adminDiscord').value.trim(),
            instagram: document.getElementById('adminInstagram').value.trim(),
            github: document.getElementById('adminGithub').value.trim(),
            whatsapp: document.getElementById('adminWhatsapp').value.trim(),
            donate: document.getElementById('adminDonate').value.trim(),
            facebook: document.getElementById('adminFacebook').value.trim()
        }
    };

    push(ref(db, 'creators'), newCreator)
        .then(() => {
            alertNotification('success', `Kreator "${name}" berhasil ditambahkan ke Realtime Database.`);
            document.getElementById('directCreatorForm').reset();
        })
        .catch((err) => {
            alertNotification('error', `Gagal menambahkan creator: ${err.message}`);
        });
}

function approveRegistration(firebaseKey) {
    const reg = registrationsList.find(r => r.firebaseKey === firebaseKey);
    if (!reg) return;

    const newCreator = {
        id: "cre_" + Date.now(),
        name: reg.name,
        role: "creator",
        bio: reg.details || `Kreator terdaftar sebagai spesialisasi Creator Minecraft Indonesia.`,
        avatar: reg.avatarUrl ||
            `https://placehold.co/120x120/141923/00F5FF?text=${reg.name.substring(0,2).toUpperCase()}`,
        socials: {
            youtube: reg.socials?.youtube || "",
            tiktok: reg.socials?.tiktok || "",
            telegram: reg.socials?.telegram || "",
            discord: reg.socials?.discord || "https://discord.gg/imcc",
            instagram: reg.socials?.instagram || "",
            github: reg.socials?.github || "",
            whatsapp: reg.socials?.whatsapp || "",
            donate: reg.socials?.donate || "",
            facebook: reg.socials?.facebook || ""
        }
    };

    push(ref(db, 'creators'), newCreator)
        .then(() => {
            remove(ref(db, 'registrations/' + firebaseKey))
                .then(() => {
                    alertNotification('success',
                        `Pendaftaran "${reg.name}" disetujui & otomatis dipublikasikan secara live!`);
                });
        })
        .catch((err) => {
            alertNotification('error', `Gagal memproses persetujuan: ${err.message}`);
        });
}

function rejectRegistration(firebaseKey) {
    const reg = registrationsList.find(r => r.firebaseKey === firebaseKey);
    if (!reg) return;

    remove(ref(db, 'registrations/' + firebaseKey))
        .then(() => {
            alertNotification('error', `Pendaftaran "${reg.name}" berhasil ditolak.`);
        })
        .catch((err) => {
            alertNotification('error', `Gagal menghapus antrean: ${err.message}`);
        });
}

// ============================================
// CONFIRM MODAL FUNCTIONS
// ============================================

function closeConfirmModal() {
    const modal = document.getElementById('confirmModal');
    modal.classList.remove('flex');
    modal.classList.add('hidden');
}

// ============================================
// CLIENT-SIDE ROUTER SYSTEM
// ============================================

function updateActivePage() {
    const hash = window.location.hash.slice(1) || 'dashboard';
    const pageId = ['dashboard', 'creators', 'join', 'admin'].includes(hash) ? hash : 'dashboard';

    // Check if trying to access admin page
    if (pageId === 'admin') {
        if (!handleAdminNavigation('admin')) {
            // If token modal is shown, revert hash to previous page
            const previousHash = sessionStorage.getItem('previousHash') || 'dashboard';
            window.location.hash = previousHash;
            return;
        }
    }

    // Save current hash for potential revert
    sessionStorage.setItem('previousHash', pageId);

    document.querySelectorAll('.virtual-page').forEach(page => {
        page.classList.remove('page-active');
        page.classList.add('hidden');
    });

    const activePageDiv = document.getElementById(`page-${pageId}`);
    if (activePageDiv) {
        activePageDiv.classList.remove('hidden');
        void activePageDiv.offsetWidth;
        activePageDiv.classList.add('page-active');
    }

    // Synchronize desktop nav pills
    document.querySelectorAll('.nav-pill').forEach(pill => {
        pill.className =
            "nav-pill px-5 py-2.5 rounded-xl text-xs font-bold tracking-widest border transition-all duration-300 uppercase flex items-center gap-2 text-gray-300 border-white/5 bg-white/[0.02]";
    });

    const activeDesktopPill = document.querySelector(`.nav-pill[data-target="${pageId}"]`);
    if (activeDesktopPill) {
        const pillStyles = {
            dashboard: "nav-pill px-5 py-2.5 rounded-xl text-xs font-bold tracking-widest border transition-all duration-300 uppercase flex items-center gap-2 border-diamond/50 bg-diamond/10 text-diamond glow-cyan",
            creators: "nav-pill px-5 py-2.5 rounded-xl text-xs font-bold tracking-widest border transition-all duration-300 uppercase flex items-center gap-2 border-emeraldGlow/50 bg-emeraldGlow/10 text-emeraldGlow glow-emerald",
            join: "nav-pill px-5 py-2.5 rounded-xl text-xs font-bold tracking-widest border transition-all duration-300 uppercase flex items-center gap-2 bg-gradient-to-r from-diamond to-emeraldGlow text-black border-transparent shadow-lg",
            admin: "nav-pill px-5 py-2.5 rounded-xl text-xs font-bold tracking-widest border transition-all duration-300 uppercase flex items-center gap-2 border-yellow-500/50 bg-yellow-500/10 text-yellow-500"
        };
        activeDesktopPill.className = pillStyles[pageId] || pillStyles.dashboard;
    }

    // Synchronize mobile nav pills
    document.querySelectorAll('.mobile-nav-pill').forEach(pill => {
        pill.className =
            "mobile-nav-pill flex items-center justify-between px-5 py-4 rounded-xl text-sm font-semibold tracking-wider text-gray-300 bg-mineDark-900/90 border border-white/5 transition-all uppercase";
    });

    const activeMobilePill = document.querySelector(`.mobile-nav-pill[data-target="${pageId}"]`);
    if (activeMobilePill) {
        const mobilePillStyles = {
            dashboard: "mobile-nav-pill flex items-center justify-between px-5 py-4 rounded-xl text-sm font-semibold tracking-wider text-diamond bg-diamond/5 border-diamond/30 transition-all uppercase",
            creators: "mobile-nav-pill flex items-center justify-between px-5 py-4 rounded-xl text-sm font-semibold tracking-wider text-emeraldGlow bg-emeraldGlow/5 border-emeraldGlow/30 transition-all uppercase",
            join: "mobile-nav-pill flex items-center justify-between px-5 py-4 rounded-xl text-sm font-bold tracking-wider text-black bg-gradient-to-r from-diamond to-emeraldGlow transition-all uppercase",
            admin: "mobile-nav-pill flex items-center justify-between px-5 py-4 rounded-xl text-sm font-bold tracking-wider text-yellow-500 bg-yellow-500/5 border-yellow-500/30 transition-all uppercase"
        };
        activeMobilePill.className = mobilePillStyles[pageId] || mobilePillStyles.dashboard;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================
// PARTICLE SYSTEM
// ============================================

const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');
let particlesArray = [];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = Math.random() * 0.3 - 0.15;
        this.speedY = Math.random() * 0.3 - 0.15;
        this.color = Math.random() > 0.5 ? '#00F5FF' : '#00FF87';
        this.opacity = Math.random() * 0.4 + 0.1;
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.opacity;
        ctx.fill();
    }
}

function initParticles() {
    particlesArray = [];
    const numberOfParticles = Math.floor((canvas.width * canvas.height) / 13000);
    for (let i = 0; i < numberOfParticles; i++) {
        particlesArray.push(new Particle());
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();
    }
    requestAnimationFrame(animateParticles);
}

// ============================================
// SEARCH & FILTER FUNCTIONALITY
// ============================================

function filterCreators() {
    const searchInput = document.getElementById('creatorSearchInput');
    if (!searchInput) return;

    const searchVal = searchInput.value.toLowerCase().trim();
    const cards = document.querySelectorAll('.creator-card');
    let visibleCount = 0;

    cards.forEach(card => {
        const name = card.getAttribute('data-name').toLowerCase();
        const matchesSearch = name.includes(searchVal);

        if (matchesSearch) {
            card.classList.remove('hidden');
            visibleCount++;
        } else {
            card.classList.add('hidden');
        }
    });

    const emptyState = document.getElementById('noResults');
    if (visibleCount === 0 && cards.length > 0) {
        emptyState.classList.remove('hidden');
    } else {
        emptyState.classList.add('hidden');
    }
}

// ============================================
// TOAST NOTIFICATION SYSTEM
// ============================================

function alertNotification(type, message) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');

    let borderColor = 'border-diamond';
    let icon = 'fa-circle-info text-diamond';
    if (type === 'success') {
        borderColor = 'border-emeraldGlow';
        icon = 'fa-circle-check text-emeraldGlow';
    } else if (type === 'error') {
        borderColor = 'border-red-500';
        icon = 'fa-circle-exclamation text-red-500';
    }

    toast.className =
        `glass-panel ${borderColor} border-l-4 p-4 rounded-xl shadow-2xl flex items-center space-x-3 w-80 translate-y-10 opacity-0 transition-all duration-300 z-50`;
    toast.innerHTML = `
        <i class="fa-solid ${icon} text-lg"></i>
        <div class="flex-1">
            <p class="text-xs font-semibold text-white">${message}</p>
        </div>
        <button onclick="this.parentElement.remove()" class="text-gray-500 hover:text-white transition-colors">
            <i class="fa-solid fa-xmark text-xs"></i>
        </button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.remove('translate-y-10', 'opacity-0');
    }, 50);

    setTimeout(() => {
        toast.classList.add('translate-y-10', 'opacity-0');
        setTimeout(() => { toast.remove(); }, 300);
    }, 5000);
}

// ============================================
// MOBILE MENU LOGIC
// ============================================

const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');
const menuIcon = document.getElementById('menuIcon');

mobileMenuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = !mobileMenu.classList.contains('hidden');
    if (isOpen) {
        mobileMenu.classList.add('hidden');
        menuIcon.className = 'fa-solid fa-bars text-2xl';
    } else {
        mobileMenu.classList.remove('hidden');
        menuIcon.className = 'fa-solid fa-xmark text-2xl';
    }
});

// Close mobile drawer on layout navigation
document.querySelectorAll('#mobileMenu a').forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
        menuIcon.className = 'fa-solid fa-bars text-2xl';
    });
});

// Close mobile menu if clicked outside
document.addEventListener('click', (e) => {
    if (!mobileMenu.classList.contains('hidden') && !mobileMenu.contains(e.target) && e.target !==
        mobileMenuBtn) {
        mobileMenu.classList.add('hidden');
        menuIcon.className = 'fa-solid fa-bars text-2xl';
    }
});

// ============================================
// EVENT LISTENERS
// ============================================

// Form submissions
document.getElementById('imccJoinForm').addEventListener('submit', handleFormSubmit);
document.getElementById('directCreatorForm').addEventListener('submit', handleDirectCreatorUpload);
document.getElementById('editCreatorForm').addEventListener('submit', handleEditCreatorSubmit);

// Confirm modal
document.getElementById('confirmYesBtn').addEventListener('click', closeConfirmModal);
document.getElementById('confirmNoBtn').addEventListener('click', closeConfirmModal);

// Token modal
document.getElementById('tokenSubmitBtn').addEventListener('click', handleTokenSubmit);
document.getElementById('tokenCancelBtn').addEventListener('click', hideTokenModal);

// Token input enter key
document.getElementById('tokenInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleTokenSubmit();
    }
});

// Upload URL button
document.getElementById('useUploadedUrlBtn').addEventListener('click', function() {
    const uploadedUrl = document.getElementById('uploadedUrl').value;
    if (uploadedUrl && targetInputId) {
        const targetInput = document.getElementById(targetInputId);
        if (targetInput) {
            targetInput.value = uploadedUrl;
            alertNotification('success', 'URL berhasil dimasukkan ke field!');
        }
    }
    closeUploadModal();
});

// Search input
document.getElementById('creatorSearchInput').addEventListener('input', filterCreators);

// Hash change and page load
window.addEventListener('hashchange', updateActivePage);
window.addEventListener('load', () => {
    updateActivePage();
    resizeCanvas();
    initParticles();
    animateParticles();
});

// Window resize
window.addEventListener('resize', () => {
    resizeCanvas();
    initParticles();
});

// ============================================
// GLOBAL FUNCTION EXPORTS
// ============================================

window.filterCreators = filterCreators;
window.approveRegistration = approveRegistration;
window.rejectRegistration = rejectRegistration;
window.deleteCreator = deleteCreator;
window.openEditModal = openEditModal;
window.closeEditModal = closeEditModal;
window.checkAdminStatus = checkAdminStatus;
window.isAdmin = () => isAdmin;
window.alertNotification = alertNotification;
