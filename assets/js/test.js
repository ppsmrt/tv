// ==========================
// Firebase Setup
// ==========================
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

// ==========================
// DOM References
// ==========================
const toastContainer = document.getElementById('toast');
const submitBtn = document.getElementById('submit-btn');
const iconFileInput = document.getElementById('channel-icon-file');
const iconHiddenInput = document.getElementById('channel-icon');
const iconPreview = document.getElementById('icon-preview');
const previewContainer = document.getElementById('preview-container');
const uploadStatus = document.getElementById('upload-status');
const userPending = document.getElementById('user-pending');
const nameInput = document.getElementById('channel-name');
const categoryInput = document.getElementById('channel-category');
const descInput = document.getElementById('channel-description');
const tagsInput = document.getElementById('channel-tags');
const imgbbApiKey = "8604e4b4050c63c460d0bca39cf28708";

// ==========================
// Toast Notifications
// ==========================
function showToast(msg, type = "info") {
  const div = document.createElement('div');
  div.className = `toast-msg ${type === "success" ? "bg-green-500" : type === "error" ? "bg-red-500" : "bg-blue-500"} text-white shadow-lg rounded p-2 my-1`;
  div.textContent = msg;
  toastContainer.appendChild(div);
  setTimeout(() => div.remove(), 3400);
}

// ==========================
// Description Templates
// ==========================
const descriptionTemplates = {
  News: (name) =>
    `Stay updated with the latest news, breaking stories, trending events, and in-depth coverage from regional, national, and international sources. Watch ${name} live on tnm3u.live.`,
  Entertainment: (name) =>
    `Catch your favorite shows, movies, and celebrity updates, along with exclusive entertainment news and trending content. Watch ${name} live on tnm3u.live.`,
  Movies: (name) =>
    `Watch blockbuster hits, timeless classics, and exclusive movie premieres anytime. Enjoy nonstop cinema magic on ${name}, only on tnm3u.live.`,
  Music: (name) =>
    `Enjoy the latest hits, timeless classics, and trending music videos across all genres. Stay tuned and feel the rhythm with ${name} on tnm3u.live.`,
  Sports: (name) =>
    `Follow live scores, match highlights, expert analysis, and all the action from your favorite sports. Watch ${name} live on tnm3u.live.`,
  Kids: (name) =>
    `Fun, learning, cartoons, and adventures designed just for kids. Keep the little ones entertained with ${name} on tnm3u.live.`,
  Religious: (name) =>
    `Experience spiritual programs, devotional songs, prayers, and live events that inspire peace and positivity. Watch ${name} on tnm3u.live.`,
  Lifestyle: (name) =>
    `Explore fashion, food, travel, health, and trends that enhance your lifestyle. Stay inspired with ${name} on tnm3u.live.`,
  Documentary: (name) =>
    `Discover real stories, history, nature, science, and culture through thought-provoking documentaries. Watch ${name} only on tnm3u.live.`,
  Education: (name) =>
    `Learn with expert lectures, tutorials, and knowledge-packed programs designed for students and lifelong learners. Stay ahead with ${name} on tnm3u.live.`,
  Regional: (name) =>
    `Get updates, news, and stories from your city and region, covering events that matter most to you. Watch ${name} live on tnm3u.live.`
};

// ==========================
// Auto-fill Description
// ==========================
function updateDescription() {
  const name = nameInput.value.trim();
  const genre = categoryInput.value;
  if (name && descriptionTemplates[genre]) {
    descInput.value = descriptionTemplates[genre](name);
  }
}
nameInput.addEventListener('input', updateDescription);
categoryInput.addEventListener('change', updateDescription);

// ==========================
// ImgBB Upload
// ==========================
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
    if (data.success) {
      iconHiddenInput.value = data.data.url;
      iconPreview.src = data.data.url;
      previewContainer.classList.remove("hidden");
      uploadStatus.textContent = "Upload successful!";
    } else uploadStatus.textContent = "Upload failed.";
  } catch (err) {
    console.error(err);
    uploadStatus.textContent = "Error uploading image.";
  }
});

// ==========================
// Submit Channel
// ==========================
submitBtn.addEventListener('click', async () => {
  const user = auth.currentUser;
  const name = nameInput.value.trim();
  const icon = iconHiddenInput.value.trim();
  const stream = document.getElementById('channel-url').value.trim();
  const category = categoryInput.value;
  const channelType = document.getElementById('channel-type').value;
  const country = document.getElementById('channel-country').value.trim() || "India";
  const description = descInput.value.trim();
  const tags = tagsInput.value.trim();
  const language = category;

  if (!name || !icon || !stream) { showToast("Please fill all fields", "error"); return; }

  try {
    // Get user display name
    const userRef = ref(db, `users/${user.uid}`);
    const userSnap = await get(userRef);
    const createdBy = userSnap.exists() ? userSnap.val().name : "Unknown User";

    const timestamp = Date.now();
    const createdAt = new Date().toISOString();

    const requestRef = push(ref(db, 'channelRequests'));
    await set(requestRef, {
      name, icon, stream,
      category, channelType, language,
      country, description, tags,
      submittedBy: user.uid,
      createdBy,
      status: 'pending',
      timestamp,
      createdAt
    });

    // Reset form
    nameInput.value = '';
    iconFileInput.value = '';
    iconHiddenInput.value = '';
    document.getElementById('channel-url').value = '';
    descInput.value = '';
    tagsInput.value = '';
    previewContainer.classList.add("hidden");
    uploadStatus.textContent = '';
    showToast("Channel request submitted!", "success");
  } catch (e) {
    console.error(e);
    showToast("Submit failed", "error");
  }
});

// ==========================
// Load Pending Channels
// ==========================
onAuthStateChanged(auth, user => {
  if (!user) { window.location.href = 'signin'; return; }
  const q = query(ref(db, 'channelRequests'), orderByChild('submittedBy'), equalTo(user.uid));
  onValue(q, snap => {
    userPending.innerHTML = '';
    if (!snap.exists()) {
      userPending.innerHTML = '<p class="text-gray-400 text-center py-4">No pending requests</p>';
      return;
    }

    snap.forEach(cs => {
      const c = cs.val();
      if (c.status !== 'pending') return;

      const date = new Date(c.timestamp).toLocaleString();
      const div = document.createElement('div');
      div.className = 'channel-card flex items-center gap-3 p-3 bg-gray-800 rounded-lg shadow mb-2';
      div.innerHTML = `
        <img src="${c.icon}" alt="${c.name}" class="w-12 h-12 rounded"/>
        <div class="flex-1">
          <h4 class="font-semibold text-white">${c.name}</h4>
          <p class="text-gray-300">Category: ${c.category}</p>
          <p class="text-gray-300">Channel Type: ${c.channelType}</p>
          <p class="text-gray-300">Tags: ${c.tags || "None"}</p>
          <p class="text-gray-300">Created By: ${c.createdBy}</p>
          <p class="text-gray-400 text-xs">Submitted At: ${date}</p>
        </div>
        <span class="pill bg-yellow-500 text-gray-900 px-2 py-1 rounded text-sm">Pending</span>
      `;
      userPending.appendChild(div);
    });
  });
});