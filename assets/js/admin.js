import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getDatabase, ref, push, set, update, remove, onValue } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-database.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js";

// Firebase config
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

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

const form = document.getElementById("channelForm");
const channelList = document.getElementById("channelList");
const submitBtn = document.getElementById("submitBtn");
const filterCategory = document.getElementById("filterCategory");
const searchInput = document.getElementById("searchInput");
const sortOption = document.getElementById("sortOption");

// Upload icon
const uploadIconInput = document.getElementById("uploadIcon");
const iconHidden = document.getElementById("icon");
const uploadStatus = document.getElementById("uploadStatus");

uploadIconInput.addEventListener("change", async () => {
  const file = uploadIconInput.files[0];
  if (!file) return;
  uploadStatus.textContent = "Uploading...";
  const formData = new FormData();
  formData.append("image", file);
  try {
    const response = await fetch(`https://api.imgbb.com/1/upload?key=8604e4b4050c63c460d0bca39cf28708`, {
      method: "POST",
      body: formData
    });
    const data = await response.json();
    if (data.success) {
      iconHidden.value = data.data.url;
      showToast("Image uploaded successfully!");
      uploadStatus.textContent = "";
      uploadIconInput.value = "";
    } else {
      showToast("Upload failed!", "error");
      uploadStatus.textContent = "";
    }
  } catch (error) {
    showToast("Error uploading image!", "error");
    uploadStatus.textContent = "";
    console.error(error);
  }
});

// Toast notifications
function showToast(message, type = "success") {
  const existing = document.querySelector(".toast");
  if (existing) existing.remove();
  const toast = document.createElement("div");
  toast.className = `toast fixed bottom-5 right-5 px-5 py-3 rounded-lg shadow-lg text-white font-semibold z-50 transition-transform transform ${
    type === "success" ? "bg-green-600" : type === "error" ? "bg-red-600" : "bg-gray-600"
  }`;
  toast.textContent = message;
  document.body.appendChild(toast);
  toast.style.opacity = "0";
  toast.style.transform = "translateY(50px)";
  setTimeout(() => {
    toast.style.transition = "opacity 0.3s, transform 0.3s";
    toast.style.opacity = "1";
    toast.style.transform = "translateY(0)";
  }, 50);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(50px)";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Status helper
function showStatus(msg, isError = false) {
  showToast(msg, isError ? "error" : "success");
}

// Templates for auto description
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
International: (name) =>
  `Stay connected with global news, world events, international culture, and major happenings from around the globe. Watch ${name} live on tnm3u.live.`,
};

const nameInput = document.getElementById("name");
const channelTypeSelect = document.getElementById("channelType");
const descriptionBox = document.getElementById("description");

function autoGenerateDescription() {
  const name = nameInput.value.trim() || "this channel";
  const type = channelTypeSelect.value;
  if (descriptionTemplates[type]) {
    descriptionBox.value = descriptionTemplates[type](name);
  }
}

nameInput.addEventListener("input", autoGenerateDescription);
channelTypeSelect.addEventListener("change", autoGenerateDescription);

// Channels data
let channelsData = {};

// Submit form
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const channelId = document.getElementById("channelId").value;
  const name = nameInput.value.trim();
  const icon = document.getElementById("icon").value.trim();
  const stream = document.getElementById("stream").value.trim();
  const category = document.getElementById("category").value;
  const channelType = channelTypeSelect.value;
  const language = document.getElementById("language").value;
  const country = document.getElementById("country").value.trim();
  const tags = document.getElementById("tags").value.trim();
  const description = descriptionBox.value.trim();

  if (!name || !icon || !stream || !category || !channelType || !language || !country) {
    showStatus("⚠️ Please fill all required fields.", true);
    return;
  }

  submitBtn.disabled = true;
  try {
    const now = new Date().toISOString();
    const user = auth.currentUser;
    let adminName = "Unknown Admin";

    if (user) {
      const adminRef = ref(db, "admins/" + user.uid + "/name");
      const snapshot = await new Promise(resolve => onValue(adminRef, resolve, { onlyOnce: true }));
      if (snapshot.exists()) adminName = snapshot.val();
    }

    const channelData = {
      name,
      icon,
      stream,
      category,
      channelType,
      language,
      country,
      tags,
      description
    };

    if (channelId) {
      await update(ref(db, "channels/" + channelId), {
        ...channelData,
        editedAt: now,
        editedBy: adminName
      });
      showStatus("✅ Channel updated!");
    } else {
      const newRef = push(ref(db, "channels"));
      await set(newRef, {
        ...channelData,
        createdAt: now,
        createdBy: adminName
      });
      showStatus("✅ Channel added!");
    }

    form.reset();
    document.getElementById("channelId").value = "";
    descriptionBox.value = "";
  } catch (err) {
    showStatus("❌ Error: " + err.message, true);
  } finally {
    submitBtn.disabled = false;
  }
});

// Render channels
function renderChannels() {
  channelList.innerHTML = "";
  const searchTerm = searchInput.value.toLowerCase();
  const selectedCategory = filterCategory.value;
  const sortBy = sortOption.value;

  let filtered = Object.entries(channelsData).filter(([id, ch]) => {
    const matchesCategory = selectedCategory === "All" || ch.category === selectedCategory;
    const matchesSearch = ch.name.toLowerCase().includes(searchTerm);
    return matchesCategory && matchesSearch;
  });

  if (sortBy === "az") filtered.sort((a, b) => a[1].name.localeCompare(b[1].name));
  else if (sortBy === "latest") filtered.sort((a, b) => new Date(b[1].createdAt || 0) - new Date(a[1].createdAt || 0));
  else if (sortBy === "oldest") filtered.sort((a, b) => new Date(a[1].createdAt || 0) - new Date(b[1].createdAt || 0));

  if (!filtered.length) {
    channelList.innerHTML = "<p class='text-gray-500'>No matching channels found.</p>";
    return;
  }

  filtered.forEach(([id, ch]) => {
    const card = document.createElement("div");
    card.className = "flex items-center bg-white shadow-md rounded-xl p-4 gap-4";
    card.innerHTML = `
      <img src="${ch.icon}" alt="${ch.name}" class="w-16 h-16 object-contain rounded-lg border"/>
      <div class="flex-1">
        <h3 class="text-lg font-bold">${ch.name}</h3>
        <p class="text-gray-600 text-sm">${ch.category} | ${ch.channelType || "N/A"}</p>
      </div>
      <div class="flex gap-2">
        <button class="editBtn bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600" data-id="${id}">
          <i class="fa-solid fa-pen"></i>
        </button>
        <button class="deleteBtn bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600" data-id="${id}">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    `;
    channelList.appendChild(card);
  });

  attachActions();
}

// Edit/Delete actions
function attachActions() {
  document.querySelectorAll(".editBtn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const ch = channelsData[id];
      document.getElementById("channelId").value = id;
      nameInput.value = ch.name;
      iconHidden.value = ch.icon;
      document.getElementById("stream").value = ch.stream;
      document.getElementById("category").value = ch.category;
      channelTypeSelect.value = ch.channelType || "Entertainment";
      document.getElementById("language").value = ch.language;
      document.getElementById("country").value = ch.country;
      document.getElementById("tags").value = ch.tags || "";
      descriptionBox.value = ch.description || "";
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  document.querySelectorAll(".deleteBtn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      if (confirm("Are you sure you want to delete this channel?")) {
        try {
          await remove(ref(db, "channels/" + id));
          showStatus("✅ Channel deleted!");
        } catch (err) {
          showStatus("❌ Error deleting channel: " + err.message, true);
        }
      }
    });
  });
}

// Fetch channels
const channelsRef = ref(db, "channels");
onValue(channelsRef, snapshot => {
  channelsData = snapshot.val() || {};
  renderChannels();
});

filterCategory.addEventListener("change", renderChannels);
searchInput.addEventListener("input", renderChannels);
sortOption.addEventListener("change", renderChannels);

// Logout
document.getElementById("logoutBtn").addEventListener("click", () => {
  signOut(auth)
    .then(() => {
      showToast("Logged out successfully!");
      setTimeout(() => window.location.href = "/", 1000);
    })
    .catch(err => showToast("Logout failed: " + err.message, "error"));
});