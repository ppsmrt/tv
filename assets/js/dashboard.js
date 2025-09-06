// Firebase config
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

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

const userSection = document.getElementById('user-section');
const adminSection = document.getElementById('admin-section');
const welcomeMsg = document.getElementById('welcome-msg');
const userRequestsList = document.getElementById('user-requests');
const adminRequestsList = document.getElementById('admin-requests');

const liveChannelsList = document.createElement('ul'); // For approved channels
userSection.appendChild(liveChannelsList);

// Check auth state
auth.onAuthStateChanged(async (user) => {
  if (!user) {
    alert('Please log in first.');
    window.location.href = 'login.html';
    return;
  }

  welcomeMsg.textContent = `Welcome, ${user.email}`;

  const isAdmin = await checkAdmin(user.uid);

  if (isAdmin) {
    adminSection.classList.remove('hidden');
    loadAdminRequests();
  } else {
    userSection.classList.remove('hidden');
    loadUserRequests(user.uid);
    loadApprovedChannels();
  }
});

// Check if user is admin
async function checkAdmin(uid) {
  const snapshot = await db.ref(`admins/${uid}`).get();
  return snapshot.exists();
}

// ================= User Functions =================
function submitChannel() {
  const name = document.getElementById('channel-name').value.trim();
  const url = document.getElementById('channel-url').value.trim();
  const user = auth.currentUser;

  if (!name || !url) {
    alert('Please enter both name and URL');
    return;
  }

  const requestId = db.ref('channelRequests').push().key;
  db.ref(`channelRequests/${requestId}`).set({
    name,
    url,
    submittedBy: user.uid,
    status: 'pending',
    timestamp: Date.now()
  }).then(() => {
    alert('Channel request submitted!');
    document.getElementById('channel-name').value = '';
    document.getElementById('channel-url').value = '';
  });
}

function loadUserRequests(uid) {
  userRequestsList.innerHTML = '';
  db.ref('channelRequests').orderByChild('submittedBy').equalTo(uid).on('value', snapshot => {
    userRequestsList.innerHTML = '';
    snapshot.forEach(child => {
      const request = child.val();
      const li = document.createElement('li');
      li.textContent = `${request.name} - ${request.status}`;
      userRequestsList.appendChild(li);
    });
  });
}

function loadApprovedChannels() {
  liveChannelsList.innerHTML = '';
  db.ref('channels').on('value', snapshot => {
    liveChannelsList.innerHTML = '';
    snapshot.forEach(child => {
      const channel = child.val();
      const li = document.createElement('li');
      li.textContent = `${channel.name} - ${channel.url}`;
      liveChannelsList.appendChild(li);
    });
  });
}

// ================= Admin Functions =================
function loadAdminRequests() {
  adminRequestsList.innerHTML = '';
  db.ref('channelRequests').orderByChild('status').equalTo('pending').on('value', snapshot => {
    adminRequestsList.innerHTML = '';
    snapshot.forEach(child => {
      const request = child.val();
      const li = document.createElement('li');
      li.textContent = `${request.name} (${request.url}) by ${request.submittedBy}`;

      const approveBtn = document.createElement('button');
      approveBtn.textContent = 'Approve';
      approveBtn.classList.add('approve-btn');
      approveBtn.onclick = () => approveRequest(child.key, request);

      const rejectBtn = document.createElement('button');
      rejectBtn.textContent = 'Reject';
      rejectBtn.classList.add('reject-btn');
      rejectBtn.onclick = () => rejectRequest(child.key);

      li.appendChild(approveBtn);
      li.appendChild(rejectBtn);

      adminRequestsList.appendChild(li);
    });
  });
}

function approveRequest(requestId, request) {
  const adminId = auth.currentUser.uid;
  const channelId = db.ref('channels').push().key;

  // Add to channels
  db.ref(`channels/${channelId}`).set({
    name: request.name,
    url: request.url,
    addedBy: adminId
  }).then(() => {
    // Update request status
    db.ref(`channelRequests/${requestId}`).update({ status: 'approved' });
  });
}

function rejectRequest(requestId) {
  db.ref(`channelRequests/${requestId}`).update({ status: 'rejected' });
}