// dashboard.js
document.addEventListener('DOMContentLoaded', () => {
  const firebaseConfig = {
    apiKey: "AIzaSyB9GaCbYFH22WbiLs1pc_UJTsM_0Tetj6E",
    authDomain: "tnm3ulive.firebaseapp.com",
    databaseURL: "https://tnm3ulive-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "tnm3ulive",
    storageBucket: "tnm3ulive.appspot.com",
    messagingSenderId: "80664356882",
    appId: "1:80664356882:web:c8464819b0515ec9b210cb",
    measurementId: "G-FNS9JWZ9LS"
  };
  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  const db = firebase.database();

  const userSection = document.getElementById('user-section');
  const adminSection = document.getElementById('admin-section');
  const userPending = document.getElementById('user-pending');
  const userApproved = document.getElementById('user-approved');
  const adminRequestsList = document.getElementById('admin-requests');
  const submitBtn = document.getElementById('submit-channel-btn');
  const uploadStatus = document.getElementById('upload-status');
  const fileInput = document.getElementById('channel-icon-file');

  // Toast function
  function showToast(message, type = "info") {
    const toast = document.createElement('div');
    toast.className = `
      flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-white transition-all duration-300 transform
      opacity-0 translate-x-10
      ${type === "success" ? "bg-green-500" :
        type === "error" ? "bg-red-500" :
        "bg-gray-700"}
    `;
    const icon = document.createElement('span');
    icon.className = 'material-icons';
    icon.textContent = type === "success" ? 'check_circle' : type === "error" ? 'error' : 'info';
    toast.appendChild(icon);
    const msg = document.createElement('span');
    msg.textContent = message;
    toast.appendChild(msg);
    document.getElementById('toast-container').appendChild(toast);
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(0)';
    });
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(50px)';
      toast.addEventListener('transitionend', () => toast.remove());
    }, 3000);
  }

  // Upload image to ImgBB
  async function uploadToImgBB(file) {
    const formData = new FormData();
    formData.append("image", file);
    const res = await fetch("https://api.imgbb.com/1/upload?key=8604e4b4050c63c460d0bca39cf28708", {
      method: "POST", body: formData
    });
    const data = await res.json();
    if (data.success) return data.data.url;
    throw new Error("Image upload failed");
  }

  // Submit channel
  async function submitChannel() {
    const name = document.getElementById('channel-name').value.trim();
    const url = document.getElementById('channel-url').value.trim();
    const category = document.getElementById('channel-category').value;
    const user = auth.currentUser ;

    if (!user) {
      showToast("User  not signed in", "error");
      return;
    }
    if (!name || !url || !category || fileInput.files.length === 0) {
      showToast("Fill all fields and upload image", "error");
      return;
    }

    try {
      submitBtn.disabled = true;
      uploadStatus.textContent = "Uploading image...";
      const iconUrl = await uploadToImgBB(fileInput.files[0]);
      uploadStatus.textContent = "Image uploaded ✔";

      const requestId = db.ref('channelRequests').push().key;
      await db.ref(`channelRequests/${requestId}`).set({
        name,
        icon: iconUrl,
        stream: url,
        category,
        submittedBy: user.uid,
        submittedByName: user.displayName || user.email,
        status: 'pending',
        timestamp: Date.now()
      });

      showToast('Channel request submitted', 'success');
      document.getElementById('channel-name').value = '';
      document.getElementById('channel-url').value = '';
      document.getElementById('channel-category').value = '';
      fileInput.value = '';
      uploadStatus.textContent = '';
      loadUser Channels(user.uid);
    } catch (err) {
      console.error(err);
      uploadStatus.textContent = "Upload failed ❌";
      showToast("Failed to upload image", "error");
    } finally {
      submitBtn.disabled = false;
    }
  }

  // Load user channels
  function loadUser Channels(uid) {
    const q = db.ref('channelRequests').orderByChild('submittedBy').equalTo(uid);
    q.on('value', snap => {
      userPending.innerHTML = '';
      userApproved.innerHTML = '';
      if (!snap.exists()) return;

      const items = [];
      snap.forEach(childSnap => {
        items.push({ id: childSnap.key, ...childSnap.val() });
      });

      items.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

      items.forEach(c => {
        const status = (c.status || 'pending').toLowerCase();
        const card = document.createElement('div');
        card.className = 'flex items-center gap-4 p-3 bg-gray-700 rounded-xl shadow-md hover:shadow-lg transition-shadow';
        card.innerHTML = `
          <img src="${c.icon}" class="w-16 h-16 rounded-lg object-cover border border-gray-600"/>
          <div class="flex-1">
            <h4 class="font-semibold text-white">${c.name}</h4>
            <p class="text-gray-300">${c.category}</p>
          </div>
          <span class="px-2 py-1 rounded-xl text-sm ${status === 'approved' ? 'bg-green-500' : 'bg-yellow-500'}">${status}</span>
        `;
        if (status === 'pending') userPending.appendChild(card);
        else if (status === 'approved') userApproved.appendChild(card);
      });
    });
  }

  // Approve request
  async function approveRequest(id, channelData) {
    try {
      const editedName = document.getElementById(`name-${id}`).value.trim() || channelData.name;
      const editedStream = document.getElementById(`stream-${id}`).value.trim() || channelData.stream;
      const editedCategory = document.getElementById(`category-${id}`).value || channelData.category;
      const iconFileInput = document.getElementById(`icon-file-${id}`);

      let iconUrl = channelData.icon;

      if (iconFileInput.files.length > 0) {
        iconUrl = await uploadToImgBB(iconFileInput.files[0]);
        document.getElementById(`icon-preview-${id}`).src = iconUrl;
      }

      const newChannelRef = db.ref('channels').push();
      await newChannelRef.set({
        name: editedName,
        icon: iconUrl,
        stream: editedStream,
        category: editedCategory,
        createdBy: channelData.submittedByName || channelData.submittedBy,
        createdAt: Date.now()
      });

      await db.ref(`channelRequests/${id}`).remove();
      showToast(`${editedName} approved and added!`, 'success');
    } catch (err) {
      console.error(err);
      showToast("Error approving: " + err.message, 'error');
    }
  }

  // Reject request
  async function rejectRequest(id) {
    if (!confirm("Are you sure you want to reject this request?")) return;
    try {
      await db.ref(`channelRequests/${id}`).remove();
      showToast("Request rejected", "success");
    } catch (err) {
      console.error(err);
      showToast("Error rejecting: " + err.message, "error");
    }
  }

  // Load admin requests
  function loadAdminRequests() {
    const requestsRef = db.ref('channelRequests').orderByChild('status').equalTo('pending');
    requestsRef.on('value', snap => {
      adminRequestsList.innerHTML = '';
      if (!snap.exists()) {
        adminRequestsList.innerHTML = '<p class="text-gray-400 text-center py-4">No pending requests</p>';
        return;
      }
      snap.forEach(child => {
        const r = child.val();
        const li = document.createElement('div');
        li.className = 'channel-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4';

        li.innerHTML = `
          <div class="flex flex-col md:flex-row items-center gap-4 p-4 bg-gray-900 rounded-xl shadow-lg w-full max-w-4xl mx-auto border border-gray-700">
            <div class="relative">
              <img src="${r.icon}" class="w-20 h-20 md:w-24 md:h-24 rounded-lg object-cover border border-gray-600" id="icon-preview-${child.key}" />
            </div>
            <div class="flex-1 flex flex-col gap-3 w-full">
              <input 
                type="text" 
                class="w-full px-4 py-2 rounded-lg bg-gray-800 text-gray-100 placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                value="${r.name}" 
                id="name-${child.key}" 
                placeholder="Channel Name" 
              />
              <input 
                type="text" 
                class="w-full px-4 py-2 rounded-lg bg-gray-800 text-gray-100 placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                value="${r.stream || ''}" 
                id="stream-${child.key}" 
                placeholder="Stream URL" 
              />
              <select 
                id="category-${child.key}" 
                class="w-full px-4 py-2 rounded-lg bg-gray-800 text-gray-100 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Tamil" ${r.category === 'Tamil' ? 'selected' : ''}>Tamil</option>
                <option value="Telugu" ${r.category === 'Telugu' ? 'selected' : ''}>Telugu</option>
                <option value="Kannada" ${r.category === 'Kannada' ? 'selected' : ''}>Kannada</option>
                <option value="Malayalam" ${r.category === 'Malayalam' ? 'selected' : ''}>Malayalam</option>
                <option value="Hindi" ${r.category === 'Hindi' ? 'selected' : ''}>Hindi</option>
                <option value="Kids" ${r.category === 'Kids' ? 'selected' : ''}>Kids</option>
                <option value="Sports" ${r.category === 'Sports' ? 'selected' : ''}>Sports</option>
              </select>
              <label for="icon-file-${child.key}" class="flex items-center justify-center gap-2 w-full px-4 py-2 mt-2 rounded-lg bg-gray-800 text-gray-200 border border-gray-700 cursor-pointer hover:bg-gray-700 transition">
                <span class="material-icons">upload</span>
                <span>Upload Channel Icon</span>
              </label>
              <input type="file" class="hidden" id="icon-file-${child.key}" accept="image/*" />
            </div>
          </div>
        `;

        const btns = document.createElement('div');
        btns.className = 'flex gap-2 mt-4 md:mt-0';
        const approve = document.createElement('button');
        approve.textContent = 'Approve';
        approve.className = 'bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600';
        approve.onclick = () => approveRequest(child.key, r);
        const reject = document.createElement('button');
        reject.textContent = 'Reject';
        reject.className = 'bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600';
        reject.onclick = () => rejectRequest(child.key);
        btns.appendChild(approve);
        btns.appendChild(reject);
        li.appendChild(btns);
        adminRequestsList.appendChild(li);

        // Add event listener for file input to preview and upload on admin side
        const iconFileInput = document.getElementById(`icon-file-${child.key}`);
        iconFileInput.addEventListener('change', async () => {
          if (iconFileInput.files.length === 0) return;
          try {
            showToast("Uploading new icon...", "info");
            const newUrl = await uploadToImgBB(iconFileInput.files[0]);
            document.getElementById(`icon-preview-${child.key}`).src = newUrl;
            showToast("Icon uploaded! Click Approve to save changes.", "success");
          } catch (err) {
            console.error(err);
            showToast("Failed to upload icon", "error");
          }
        });
      });
    });
  }

  // Auth state listener
  auth.onAuthStateChanged(async user => {
    if (!user) {
      showToast('Please log in', 'error');
      setTimeout(() => window.location.href = 'signin', 1000);
      return;
    }

    // Check if admin
    const isAdmin = await db.ref(`admins/${user.uid}`).get().then(snap => snap.exists());
    if (isAdmin) {
      adminSection.classList.remove('hidden');
      userSection.classList.add('hidden');
      loadAdminRequests();
    } else {
      userSection.classList.remove('hidden');
      adminSection.classList.add('hidden');
      loadUser Channels(user.uid);
    }
  });

  // Attach submit button event
  submitBtn.addEventListener('click', submitChannel);

  // Logout button
  document.getElementById('logout-btn').addEventListener('click', async () => {
    await auth.signOut();
    showToast('Logged out', 'info');
    setTimeout(() => window.location.href = 'signin', 1000);
  });

  // Refresh admin requests button
  document.getElementById('refresh-admin-requests').addEventListener('click', loadAdminRequests);
});