import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getDatabase, ref, set, get, onValue, push, remove, query, orderByChild, equalTo } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyB9GaCbYFH22WbiLs1pc_UJTsM_0Tetj6E",
  authDomain: "tnm3ulive.firebaseapp.com",
  databaseURL: "https://tnm3ulive-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "tnm3ulive",
  storageBucket: "tnm3ulive.firebasestorage.app",
  messagingSenderId: "80664356882",
  appId: "1:80664356882:web:c8464819b0515ec9b210cb",
  measurementId: "G-FNS9JWZ9LS"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// DOM Elements
const userSection = document.getElementById('user-section');
const adminSection = document.getElementById('admin-section');
const welcomeMsg = document.getElementById('welcome-msg');
const userPending = document.getElementById('user-pending');
const userApproved = document.getElementById('user-approved');
const adminRequestsList = document.getElementById('admin-requests');
const toastContainer = document.getElementById('toast');

const iconInput = document.getElementById('channel-icon-upload');
const iconPreview = document.getElementById('channel-icon-preview');
const iconStatus = document.getElementById('channel-icon-status');
const submitSpinner = document.getElementById('submit-spinner');
let uploadedIconURL = '';
const imgbbKey = '8604e4b4050c63c460d0bca39cf28708';

// ===== Toast =====
function showToast(msg, type="info") {
  const div = document.createElement('div');
  div.className = `toast-msg ${type==="success" ? "bg-green-500" : type==="error" ? "bg-red-500" : "bg-blue-500"} text-white shadow-lg`;
  div.textContent = msg;
  toastContainer.appendChild(div);
  setTimeout(() => div.remove(), 3500);
}

// ===== Upload Image to ImgBB =====
iconInput.addEventListener('change', async () => {
  const file = iconInput.files[0];
  if (!file) return;

  iconStatus.textContent = 'Uploading...';
  iconPreview.classList.add('hidden');

  const formData = new FormData();
  formData.append('image', file);

  try {
    const res = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbKey}`, {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    if (data.success) {
      uploadedIconURL = data.data.url;
      iconPreview.src = uploadedIconURL;
      iconPreview.classList.remove('hidden');
      iconStatus.textContent = 'Upload successful!';
    } else {
      iconStatus.textContent = 'Upload failed, try again.';
      uploadedIconURL = '';
    }
  } catch (err) {
    console.error(err);
    iconStatus.textContent = 'Error uploading image.';
    uploadedIconURL = '';
  }
});

// ===== Get user name from UID =====
async function getUserName(uid) {
  if (!uid) return "Unknown";
  try {
    const snap = await get(ref(db, `users/${uid}/name`));
    return snap.exists() ? snap.val() : uid;
  } catch { return uid; }
}

// ===== Auth listener =====
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    showToast("Please log in", "error");
    window.location.href='signin';
    return;
  }
  welcomeMsg.textContent = `Welcome, ${user.email}`;

  const adminSnap = await get(ref(db, `admins/${user.uid}`));
  const isAdmin = adminSnap.exists();

  if (isAdmin) {
    adminSection.classList.remove('hidden');
    loadAdminRequests();
  } else {
    userSection.classList.remove('hidden');
    loadUserChannels(user.uid);
  }
});

// ===== Logout =====
document.getElementById('logout-btn').addEventListener('click', () => {
  signOut(auth)
    .then(() => { showToast("Logged out", "success"); window.location.href = '/'; })
    .catch(() => showToast("Error logging out", "error"));
});

// ===== User Functions =====
async function submitChannel() {
  const name = document.getElementById('channel-name').value.trim();
  const icon = uploadedIconURL;
  const url = document.getElementById('channel-url').value.trim();
  const category = document.getElementById('channel-category').value;
  const user = auth.currentUser;

  if(!name || !url || !icon){
    showToast("Please fill all fields and upload icon", "error");
    return;
  }

  submitSpinner.classList.remove('hidden');

  const requestRef = push(ref(db, 'channelRequests'));
  await set(requestRef, {
    name, icon, url, category,
    submittedBy: user.uid,
    status: 'pending',
    timestamp: Date.now()
  });

  // Reset form
  document.getElementById('channel-name').value = '';
  iconInput.value = '';
  uploadedIconURL = '';
  iconPreview.classList.add('hidden');
  iconStatus.textContent = 'No file selected';
  document.getElementById('channel-url').value = '';
  submitSpinner.classList.add('hidden');

  showToast("Channel request submitted!", "success");
}
window.submitChannel = submitChannel;

// ===== Load user channels =====
function loadUserChannels(uid) {
  const q = query(ref(db, 'channelRequests'), orderByChild('submittedBy'), equalTo(uid));
  onValue(q, async (snap) => {
    userPending.innerHTML = '';
    userApproved.innerHTML = '';

    if (!snap.exists()) {
      userPending.innerHTML = '<p class="text-gray-400 text-center py-4">No channel requests yet</p>';
      return;
    }

    snap.forEach(async (childSnap) => {
      const c = childSnap.val();
      const userName = await getUserName(c.submittedBy);

      const card = document.createElement('div');
      card.className = 'flex items-center gap-4 p-3 bg-gray-700 rounded-xl shadow-md hover:shadow-lg transition-shadow';
      card.innerHTML = `
        <img src="${c.icon || 'https://via.placeholder.com/50'}" class="w-16 h-16 rounded-lg object-cover border border-gray-600"/>
        <div class="flex-1">
          <h4 class="font-semibold text-white">${c.name || 'Untitled'}</h4>
          <p class="text-gray-300">${c.category || 'Uncategorized'}</p>
          <span class="text-sm text-gray-400">Submitted by: ${userName}</span>
        </div>
        <span class="px-3 py-1 rounded-full text-sm font-semibold ${c.status === 'pending' ? 'bg-yellow-500 text-gray-900' : 'bg-green-500 text-white'}">
          ${c.status ? c.status.charAt(0).toUpperCase() + c.status.slice(1) : 'Unknown'}
        </span>
      `;
      if (c.status === 'pending') userPending.appendChild(card);
      else if (c.status === 'approved') userApproved.appendChild(card);
    });
  });
}

// ===== Admin Functions =====
function loadAdminRequests() {
  const requestsRef = ref(db, 'channelRequests');
  onValue(requestsRef, async (snap) => {
    adminRequestsList.innerHTML = '';
    if (!snap.exists()) {
      adminRequestsList.innerHTML = '<p class="text-gray-400 text-center py-4">No pending requests</p>';
      return;
    }
    let hasPending = false;
    snap.forEach(async (childSnap) => {
      const r = childSnap.val();
      if (r.status !== 'pending') return;
      hasPending = true;
      const userName = await getUserName(r.submittedBy);

      const li = document.createElement('div');
      li.className = 'channel-card justify-between flex items-center p-3 bg-gray-700 rounded-xl shadow-md hover:shadow-lg transition-shadow';
      li.innerHTML = `
        <div class="flex items-center gap-4">
          <img src="${r.icon || 'https://via.placeholder.com/50'}" class="w-16 h-16 rounded-lg border border-gray-600"/>
          <div>
            <h4 class="font-semibold text-white">${r.name || 'Untitled Channel'}</h4>
            <p class="text-gray-300">${r.category || 'Uncategorized'}</p>
            <span class="text-sm text-gray-400">Submitted by: ${userName}</span>
          </div>
        </div>
      `;

      const btns = document.createElement('div'); 
      btns.className = 'flex gap-2';

      const approve = document.createElement('button');
      approve.textContent = 'Approve';
      approve.className = 'px-3 py-1 bg-green-500 rounded hover:bg-green-600 text-white font-semibold';
      approve.onclick = () => approveRequest(childSnap.key, r);

      const reject = document.createElement('button');
      reject.textContent = 'Reject';
      reject.className = 'px-3 py-1 bg-red-500 rounded hover:bg-red-600 text-white font-semibold';
      reject.onclick = () => rejectRequest(childSnap.key);

      btns.appendChild(approve); 
      btns.appendChild(reject);
      li.appendChild(btns);
      adminRequestsList.appendChild(li);
    });
    if (!hasPending) {
      adminRequestsList.innerHTML = '<p class="text-gray-400 text-center py-4">No pending requests</p>';
    }
  });
}

async function approveRequest(requestId, requestData) {
  const adminId = auth.currentUser.uid;
  if (!requestData) return;

  const newChannelRef = push(ref(db, 'channels'));
  await set(newChannelRef, {
    name: requestData.name || 'Unnamed Channel',
    icon: requestData.icon || '',
    category: requestData.category || 'Uncategorized',
    stream: requestData.url || '',
    createdBy: requestData.submittedBy || 'unknown',
    approvedBy: adminId,
    approvedAt: Date.now()
  });

  await remove(ref(db, `channelRequests/${requestId}`));
  showToast("Channel approved", "success");
}

async function rejectRequest(requestId){
  await remove(ref(db, `channelRequests/${requestId}`));
  showToast("Channel rejected", "error");
}