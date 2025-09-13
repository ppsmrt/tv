import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getDatabase, ref, set, push, onValue, query, orderByChild, equalTo, get } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

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

const toastContainer = document.getElementById('toast');
const submitBtn = document.getElementById('submit-btn');
const iconFileInput = document.getElementById('channel-icon-file');
const iconHiddenInput = document.getElementById('channel-icon');
const iconPreview = document.getElementById('icon-preview');
const previewContainer = document.getElementById('preview-container');
const uploadStatus = document.getElementById('upload-status');
const userPending = document.getElementById('user-pending');
const imgbbApiKey = "8604e4b4050c63c460d0bca39cf28708";

function showToast(msg, type="info") {
  const div = document.createElement('div');
  div.className = `toast-msg ${type==="success"?"bg-green-500":type==="error"?"bg-red-500":"bg-blue-500"} text-white shadow-lg`;
  div.textContent = msg;
  toastContainer.appendChild(div);
  setTimeout(()=>div.remove(), 3400);
}

// ImgBB Upload
iconFileInput.addEventListener("change", async () => {
  const file = iconFileInput.files[0];
  if (!file) return;
  uploadStatus.textContent = "Uploading...";
  previewContainer.classList.add("hidden");

  const formData = new FormData();
  formData.append("image", file);

  try {
    const res = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbApiKey}`, { method: "POST", body: formData });
    const data = await res.json();
    if(data.success){
      iconHiddenInput.value = data.data.url;
      iconPreview.src = data.data.url;
      previewContainer.classList.remove("hidden");
      uploadStatus.textContent = "Upload successful!";
    } else uploadStatus.textContent = "Upload failed.";
  } catch(err){
    console.error(err);
    uploadStatus.textContent = "Error uploading image.";
  }
});

// Submit Channel
submitBtn.addEventListener('click', async ()=>{
  const user = auth.currentUser;
  const name = document.getElementById('channel-name').value.trim();
  const icon = document.getElementById('channel-icon').value.trim();
  const stream = document.getElementById('channel-url').value.trim();
  const category = document.getElementById('channel-category').value;
  const channelType = document.getElementById('channel-type').value; // ✅ updated
  const country = document.getElementById('channel-country').value.trim() || "India";
  const description = document.getElementById('channel-description').value.trim();
  const language = category;

  if(!name || !icon || !stream){ showToast("Please fill all fields","error"); return; }

  try {
    // Get user name from users node
    const userRef = ref(db, `users/${user.uid}`);
    const userSnap = await get(userRef);
    const createdBy = userSnap.exists() ? userSnap.val().name : "Unknown User";

    const timestamp = Date.now();
    const createdAt = new Date().toISOString(); // ISO format

    const requestRef = push(ref(db, 'channelRequests'));

    await set(requestRef, { 
      name, icon, stream,
      category, channelType, language,
      country, description,
      submittedBy: user.uid,   // UID for security
      createdBy,               // Display name
      status:'pending', 
      timestamp,               // milliseconds
      createdAt                // ISO string
    });

    // Reset form
    document.getElementById('channel-name').value='';
    iconFileInput.value='';
    iconHiddenInput.value='';
    document.getElementById('channel-url').value='';
    document.getElementById('channel-description').value='';
    previewContainer.classList.add("hidden");
    uploadStatus.textContent='';
    showToast("Channel request submitted!","success");
  } catch(e){
    console.error(e);
    showToast("Submit failed","error");
  }
});

// Pending Channels
onAuthStateChanged(auth, user=>{
  if(!user){ window.location.href='signin'; return; }
  const q = query(ref(db,'channelRequests'), orderByChild('submittedBy'), equalTo(user.uid));
  onValue(q, snap=>{
    userPending.innerHTML='';
    if(!snap.exists()){ userPending.innerHTML='<p class="text-gray-400 text-center py-4">No pending requests</p>'; return; }

    snap.forEach(cs=>{
      const c = cs.val();
      if(c.status!=='pending') return;

      const date = new Date(c.timestamp).toLocaleString();
      const div = document.createElement('div');
      div.className='channel-card';
      div.innerHTML = `
        <img src="${c.icon}" alt="${c.name}"/>
        <div class="flex-1">
          <h4 class="font-semibold text-white">${c.name}</h4>
          <p class="text-gray-300">Category: ${c.category}</p>
          <p class="text-gray-300">Channel Type: ${c.channelType}</p>
          <p class="text-gray-300">Created By: ${c.createdBy}</p>
          <p class="text-gray-400 text-xs">Submitted At: ${date}</p>
        </div>
        <span class="pill bg-yellow-500 text-gray-900">Pending</span>
      `;
      userPending.appendChild(div);
    });
  });
});