// تكوين Firebase
const firebaseConfig = {
    apiKey: "AIzaSyD_VAkF6qj8afL1DZdFTzP4cEK87Buk-a8",
    authDomain: "my-telegram-bot-admin5.firebaseapp.com",
    databaseURL: "https://my-telegram-bot-admin5-default-rtdb.firebaseio.com",
    projectId: "my-telegram-bot-admin5",
    storageBucket: "my-telegram-bot-admin5.appspot.com",
    messagingSenderId: "75145181226",
    appId: "1:75145181226:web:547cc1777afc12342b6b53",
    measurementId: "G-9L89YTQDYF"
};

// تهيئة Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getDatabase, ref, onValue, set, update, remove } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// إنشاء حساب المشرف
async function createAdminAccount() {
    const email = 'kader24f@gmail.com';
    const password = 'Kader@2424';
    
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // إضافة المستخدم إلى قاعدة البيانات كمشرف
        await set(ref(db, `admins/${user.uid}`), {
            email: email,
            role: 'admin',
            createdAt: Date.now()
        });
        
        console.log('تم إنشاء حساب المشرف بنجاح:', user);
        alert('تم إنشاء حساب المشرف بنجاح!');
    } catch (error) {
        console.error('خطأ في إنشاء حساب المشرف:', error);
        alert('خطأ في إنشاء حساب المشرف: ' + error.message);
    }
}

// تسجيل الدخول
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // التحقق من أن المستخدم مشرف
        const adminRef = ref(db, `admins/${user.uid}`);
        onValue(adminRef, (snapshot) => {
            if (snapshot.exists()) {
                document.getElementById('loginSection').style.display = 'none';
                document.getElementById('dashboardSection').style.display = 'block';
                loadDashboardData();
            } else {
                alert('عذراً، هذا الحساب ليس لديه صلاحيات المشرف');
                signOut(auth);
            }
        });
    } catch (error) {
        alert('خطأ في تسجيل الدخول: ' + error.message);
    }
});

// تسجيل الخروج
window.logout = async () => {
    try {
        await signOut(auth);
        document.getElementById('loginSection').style.display = 'block';
        document.getElementById('dashboardSection').style.display = 'none';
    } catch (error) {
        alert('خطأ في تسجيل الخروج: ' + error.message);
    }
};

// تحميل بيانات لوحة التحكم
function loadDashboardData() {
    // الإحصائيات
    const statsRef = ref(db, 'stats');
    onValue(statsRef, (snapshot) => {
        const stats = snapshot.val() || {};
        document.getElementById('totalUsers').textContent = stats.totalUsers || 0;
        document.getElementById('totalCoins').textContent = stats.totalCoins || 0;
        document.getElementById('activeUsers').textContent = stats.activeUsers || 0;
        document.getElementById('completedTasks').textContent = stats.completedTasks || 0;
    });

    // روابط التواصل الاجتماعي
    const socialRef = ref(db, 'social_links');
    onValue(socialRef, (snapshot) => {
        const links = snapshot.val() || {};
        document.getElementById('telegramLink').value = links.telegram || '';
        document.getElementById('facebookLink').value = links.facebook || '';
        document.getElementById('youtubeLink').value = links.youtube || '';
        document.getElementById('instagramLink').value = links.instagram || '';
    });

    // المستخدمين
    const usersRef = ref(db, 'users');
    onValue(usersRef, (snapshot) => {
        const users = snapshot.val() || {};
        const tbody = document.getElementById('usersTableBody');
        tbody.innerHTML = '';

        Object.entries(users).forEach(([id, user]) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${id}</td>
                <td>${user.username || 'غير معروف'}</td>
                <td>${user.coins || 0}</td>
                <td>${new Date(user.last_active || Date.now()).toLocaleString('ar-SA')}</td>
                <td>${Object.values(user.tasks || {}).filter(Boolean).length}</td>
                <td>
                    <button class="btn btn-sm btn-warning" onclick="editUser('${id}')">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteUser('${id}')">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    });
}

// حفظ روابط التواصل الاجتماعي
document.getElementById('socialLinksForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const links = {
        telegram: document.getElementById('telegramLink').value,
        facebook: document.getElementById('facebookLink').value,
        youtube: document.getElementById('youtubeLink').value,
        instagram: document.getElementById('instagramLink').value
    };

    try {
        await set(ref(db, 'social_links'), links);
        alert('تم حفظ الروابط بنجاح!');
    } catch (error) {
        alert('خطأ في حفظ الروابط: ' + error.message);
    }
});

// تحرير بيانات المستخدم
window.editUser = async (userId) => {
    const newCoins = prompt('أدخل عدد الكوينز الجديد:');
    if (newCoins !== null) {
        try {
            await update(ref(db, `users/${userId}`), {
                coins: parseInt(newCoins)
            });
            alert('تم تحديث بيانات المستخدم بنجاح!');
        } catch (error) {
            alert('خطأ في تحديث بيانات المستخدم: ' + error.message);
        }
    }
};

// حذف المستخدم
window.deleteUser = async (userId) => {
    if (confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
        try {
            await remove(ref(db, `users/${userId}`));
            alert('تم حذف المستخدم بنجاح!');
        } catch (error) {
            alert('خطأ في حذف المستخدم: ' + error.message);
        }
    }
};

// زر إنشاء حساب المشرف
document.getElementById('createAdminBtn')?.addEventListener('click', createAdminAccount);

// التحقق من حالة تسجيل الدخول
auth.onAuthStateChanged((user) => {
    if (user) {
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('dashboardSection').style.display = 'block';
        loadDashboardData();
    } else {
        document.getElementById('loginSection').style.display = 'block';
        document.getElementById('dashboardSection').style.display = 'none';
    }
});
