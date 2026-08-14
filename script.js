// ===== FIREBASE IMPORTS =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-analytics.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithPopup, GoogleAuthProvider, updatePassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
import { getDatabase, ref, set, update, get, child } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";

// ===== FIREBASE CONFIG =====
const firebaseConfig = {
    apiKey: "AIzaSyCcSHVnPeGa73lSh-vZNWJDod-C11lAciI",
    authDomain: "ict-from-abc.firebaseapp.com",
    projectId: "ict-from-abc",
    storageBucket: "ict-from-abc.firebasestorage.app",
    messagingSenderId: "70545428741",
    appId: "1:70545428741:web:2f77d3511d283116d6a76c",
    measurementId: "G-XYXH34MX7K"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const database = getDatabase(app);
const provider = new GoogleAuthProvider();

// ===== DOM REFS =====
const authScreen = document.getElementById('authScreen');
const dashScreen = document.getElementById('dashboardScreen');

const mobilePhone = document.getElementById('mobilePhoneInput');
const mobilePass = document.getElementById('mobilePasswordInput');
const desktopPhone = document.getElementById('desktopPhoneInput');
const desktopPass = document.getElementById('desktopPasswordInput');

const dashName = document.getElementById('dashName');
const dashPhone = document.getElementById('dashPhone');
const dashBatch = document.getElementById('dashBatch');
const dashAvatar = document.getElementById('dashAvatar');

const pFullName = document.getElementById('pFullName');
const pPhone = document.getElementById('pPhone');
const pBatch = document.getElementById('pBatch');

// ===== LOCAL STORAGE HELPERS =====
function saveUserLocally(uid, data) {
    localStorage.setItem('ict_user_uid', uid);
    localStorage.setItem('ict_user_data', JSON.stringify(data));
}

function getUserLocally() {
    const uid = localStorage.getItem('ict_user_uid');
    const data = localStorage.getItem('ict_user_data');
    return { uid, data: data ? JSON.parse(data) : null };
}

function clearUserLocally() {
    localStorage.removeItem('ict_user_uid');
    localStorage.removeItem('ict_user_data');
}

// ===== SHOW DASHBOARD =====
function showDashboard(userData) {
    authScreen.classList.add('hidden');
    dashScreen.classList.remove('hidden');

    const name = userData?.fullName || userData?.name || 'Student';
    const phone = userData?.phone || '-';
    const batch = userData?.batch || 'ICT AL 2026';

    dashName.textContent = name;
    dashPhone.textContent = phone;
    dashBatch.textContent = batch;
    dashAvatar.textContent = name[0].toUpperCase();

    if (userData?.photo) {
        dashAvatar.innerHTML = `<img src="${userData.photo}" alt="profile" />`;
    }

    pFullName.textContent = userData?.fullName || '-';
    pPhone.textContent = userData?.phone || '-';
    pBatch.textContent = userData?.batch || '-';

    document.querySelectorAll('.section-content').forEach(el => el.classList.add('hidden'));
    document.getElementById('section-home').classList.remove('hidden');
    document.querySelectorAll('.sidebar a').forEach(a => a.classList.remove('active'));
    document.querySelector('.sidebar a[data-section="home"]').classList.add('active');
}

// ===== LOGIN =====
async function loginUser(phone, pass, btnElement) {
    if (!phone || !pass) {
        alert('Please enter phone and password.');
        return;
    }

    if (btnElement) {
        btnElement.disabled = true;
        btnElement.innerHTML = '<span class="loader"></span> Logging in...';
        btnElement.classList.add('btn-loading');
    }

    try {
        const cred = await signInWithEmailAndPassword(auth, phone + '@ictfromabc.com', pass);
        const user = cred.user;
        const snapshot = await get(child(ref(database), `users/${user.uid}`));
        const data = snapshot.val() || { fullName: 'Student', phone, batch: 'ICT AL 2026' };
        data.uid = user.uid;
        saveUserLocally(user.uid, data);
        showDashboard(data);
    } catch (err) {
        alert('Invalid credentials. Please try again.');
        console.error(err);
    } finally {
        if (btnElement) {
            btnElement.disabled = false;
            btnElement.innerHTML = '🔐 Login';
            btnElement.classList.remove('btn-loading');
        }
    }
}

// ===== SIGNUP =====
async function signupUser(name, phone, pass) {
    if (!name || !phone || !pass) {
        alert('Please fill all fields.');
        return;
    }
    try {
        const cred = await createUserWithEmailAndPassword(auth, phone + '@ictfromabc.com', pass);
        const user = cred.user;
        const data = { fullName: name, phone, name, batch: 'ICT AL 2026' };
        await set(ref(database, `users/${user.uid}`), data);
        saveUserLocally(user.uid, data);
        showDashboard(data);
        closeModal('signupModal');
    } catch (err) {
        alert('Signup failed: ' + err.message);
        console.error(err);
    }
}

// ===== GOOGLE LOGIN =====
async function googleLogin() {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        const snapshot = await get(child(ref(database), `users/${user.uid}`));
        let data = snapshot.val();
        if (!data) {
            data = {
                fullName: user.displayName || 'Student',
                phone: user.phoneNumber || '',
                email: user.email,
                name: user.displayName || 'Student',
                batch: 'ICT AL 2026',
                photo: user.photoURL || ''
            };
            await set(ref(database, `users/${user.uid}`), data);
        }
        data.uid = user.uid;
        if (user.photoURL) data.photo = user.photoURL;
        saveUserLocally(user.uid, data);
        showDashboard(data);
    } catch (err) {
        alert('Google login failed. Please try again.');
        console.error(err);
    }
}

// ===== FORGOT PASSWORD =====
async function forgotPassword(phone) {
    if (!phone) {
        alert('Enter phone number.');
        return;
    }
    try {
        await sendPasswordResetEmail(auth, phone + '@ictfromabc.com');
        alert('Password reset email sent!');
        closeModal('forgotModal');
    } catch (err) {
        alert('If account exists, reset link sent. (Check console)');
        console.error(err);
        closeModal('forgotModal');
    }
}

// ===== CHANGE PASSWORD =====
async function changePassword(newPass) {
    if (!newPass) {
        alert('Enter new password.');
        return;
    }
    try {
        if (auth.currentUser) {
            await updatePassword(auth.currentUser, newPass);
            alert('Password updated successfully!');
            closeModal('changePassModal');
        } else {
            alert('Please login again to change password.');
        }
    } catch (err) {
        alert('Error updating password. Please try again.');
        console.error(err);
    }
}

// ===== SAVE PROFILE =====
async function saveProfile(data) {
    const userData = getUserLocally();
    if (!userData.uid) {
        alert('Please login first.');
        return;
    }
    try {
        if (userData.uid !== 'local') {
            await update(ref(database, `users/${userData.uid}`), data);
        }
        const merged = { ...userData.data, ...data };
        saveUserLocally(userData.uid, merged);
        showDashboard(merged);
        closeModal('profileModal');
        alert('Profile updated!');
    } catch (err) {
        alert('Error saving profile.');
        console.error(err);
    }
}

// ===== AUTH STATE OBSERVER =====
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const snapshot = await get(child(ref(database), `users/${user.uid}`));
        const data = snapshot.val() || { fullName: 'Student', phone: '', batch: 'ICT AL 2026' };
        data.uid = user.uid;
        if (user.photoURL) data.photo = user.photoURL;
        saveUserLocally(user.uid, data);
        showDashboard(data);
    } else {
        const local = getUserLocally();
        if (local.data) {
            showDashboard(local.data);
        } else {
            authScreen.classList.remove('hidden');
            dashScreen.classList.add('hidden');
        }
    }
});

// ===== EVENT BINDINGS =====
document.getElementById('mobileLoginBtn').addEventListener('click', () => {
    loginUser(mobilePhone.value.trim(), mobilePass.value.trim(), document.getElementById('mobileLoginBtn'));
});

document.getElementById('desktopLoginBtn').addEventListener('click', () => {
    loginUser(desktopPhone.value.trim(), desktopPass.value.trim(), document.getElementById('desktopLoginBtn'));
});

mobilePass.addEventListener('keydown', (e) => { if (e.key === 'Enter') document.getElementById('mobileLoginBtn').click(); });
desktopPass.addEventListener('keydown', (e) => { if (e.key === 'Enter') document.getElementById('desktopLoginBtn').click(); });

document.getElementById('mobileGoogleBtn').addEventListener('click', googleLogin);
document.getElementById('desktopGoogleBtn').addEventListener('click', googleLogin);

document.getElementById('mobileSignupLink').addEventListener('click', e => { e.preventDefault();
    openModal('signupModal'); });
document.getElementById('desktopSignupLink').addEventListener('click', e => { e.preventDefault();
    openModal('signupModal'); });
document.getElementById('mobileForgotLink').addEventListener('click', e => { e.preventDefault();
    openModal('forgotModal'); });
document.getElementById('desktopForgotLink').addEventListener('click', e => { e.preventDefault();
    openModal('forgotModal'); });

document.getElementById('signupBtn').addEventListener('click', () => {
    const name = document.getElementById('signupName').value.trim();
    const phone = document.getElementById('signupPhone').value.trim();
    const pass = document.getElementById('signupPass').value.trim();
    signupUser(name, phone, pass);
});

document.getElementById('forgotBtn').addEventListener('click', () => {
    forgotPassword(document.getElementById('forgotPhone').value.trim());
});

document.getElementById('changePassBtn').addEventListener('click', () => {
    changePassword(document.getElementById('newPass').value.trim());
});

document.getElementById('changePasswordBtn').addEventListener('click', () => openModal('changePassModal'));

document.getElementById('editProfileBtn').addEventListener('click', () => {
    const data = getUserLocally().data || {};
    document.getElementById('editFullName').value = data.fullName || data.name || '';
    document.getElementById('editPhone').value = data.phone || '';
    document.getElementById('editBatch').value = data.batch || 'ICT AL 2026';
    openModal('profileModal');
});

document.getElementById('saveProfileBtn').addEventListener('click', () => {
    const data = {
        fullName: document.getElementById('editFullName').value.trim(),
        phone: document.getElementById('editPhone').value.trim(),
        batch: document.getElementById('editBatch').value.trim() || 'ICT AL 2026'
    };
    saveProfile(data);
});

// ===== SIDEBAR NAVIGATION =====
document.querySelectorAll('.sidebar a[data-section]').forEach(link => {
    link.addEventListener('click', e => {
        e.preventDefault();
        const section = link.dataset.section;
        document.querySelectorAll('.section-content').forEach(el => el.classList.add('hidden'));
        const target = document.getElementById('section-' + section);
        if (target) target.classList.remove('hidden');
        document.querySelectorAll('.sidebar a').forEach(a => a.classList.remove('active'));
        link.classList.add('active');
    });
});

// ===== LOGOUT =====
document.getElementById('logoutBtn').addEventListener('click', async (e) => {
    e.preventDefault();
    try {
        if (auth.currentUser) await signOut(auth);
    } catch (e) {}
    clearUserLocally();
    dashScreen.classList.add('hidden');
    authScreen.classList.remove('hidden');
});

// ===== MODAL HELPERS =====
function openModal(id) { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }
window.openModal = openModal;
window.closeModal = closeModal;

document.querySelectorAll('.modal-overlay').forEach(el => el.addEventListener('click', function(e) {
    if (e.target === this) this.classList.remove('active');
}));

// ===== CHATBOT =====
const chatToggle = document.getElementById('chatToggle');
const chatWindow = document.getElementById('chatWindow');
const chatClose = document.getElementById('chatClose');
const chatInput = document.getElementById('chatInput');
const chatSend = document.getElementById('chatSend');
const chatMessages = document.getElementById('chatMessages');

chatToggle.addEventListener('click', () => chatWindow.classList.toggle('open'));
chatClose.addEventListener('click', () => chatWindow.classList.remove('open'));

function addMessage(text, type) {
    const div = document.createElement('div');
    div.className = `chat-msg ${type}`;
    div.textContent = text;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function getBotReply(input) {
    const lower = input.toLowerCase();
    if (lower.includes('class') || lower.includes('day') || lower.includes('schedule'))
        return '📅 Class days: Monday, Wednesday, Friday at 6:30 PM.';
    if (lower.includes('past paper') || lower.includes('paper'))
        return '📄 Past Papers: https://ictfromabc.com/public-dashboard/papers/al';
    if (lower.includes('about') || lower.includes('info'))
        return 'ℹ️ ICT from ABC is the largest IT class in Sri Lanka.';
    if (lower.includes('fee') || lower.includes('price'))
        return '💰 Please contact 071 455 5513 for fee details.';
    if (lower.includes('contact') || lower.includes('phone'))
        return '📞 Phone: 071 455 5513';
    return '🤔 I can help with class days, past papers, fees, or contact info.';
}

chatSend.addEventListener('click', () => {
    const text = chatInput.value.trim();
    if (!text) return;
    addMessage(text, 'user');
    chatInput.value = '';
    setTimeout(() => addMessage(getBotReply(text), 'bot'), 400);
});
chatInput.addEventListener('keydown', e => { if (e.key === 'Enter') chatSend.click(); });

console.log('🔥 Firebase connected!');
console.log('📱 Login with phone + password or Google');