// assets/js/edit-profile.js
import { getAuth, onAuthStateChanged, updateProfile } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getDatabase, ref, get, set, update } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";

// Get Firebase services initialized in main page
const { auth, db, storage } = window.firebaseServices;

// DOM Elements
const profilePic = document.getElementById("profile-pic");
const editPicBtn = document.getElementById("edit-pic-btn");
const form = document.getElementById("edit-profile-form");

const firstNameInput = document.getElementById("first-name");
const lastNameInput = document.getElementById("last-name");
const usernameInput = document.getElementById("username");
const emailInput = document.getElementById("email");
const bioInput = document.getElementById("bio");
const locationInput = document.getElementById("location");
const roleInput = document.getElementById("role");

// Load current user data
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("You must be logged in to edit your profile.");
    window.location.href = "/login.html"; 
    return;
  }

  // Fill auth-based fields
  usernameInput.value = user.displayName || user.email.split("@")[0];
  emailInput.value = user.email;

  // Fetch user profile from Realtime Database
  const userRef = ref(db, "users/" + user.uid);
  const snapshot = await get(userRef);
  if (snapshot.exists()) {
    const data = snapshot.val();
    firstNameInput.value = data.firstName || "";
    lastNameInput.value = data.lastName || "";
    bioInput.value = data.bio || "";
    locationInput.value = data.location || "";
    roleInput.value = data.role || "User";
    if (data.profilePic) {
      profilePic.src = data.profilePic;
    }
  }
});

// Handle profile picture upload
editPicBtn.addEventListener("click", () => {
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/*";
  fileInput.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const user = auth.currentUser;
    if (!user) return;

    const fileRef = storageRef(storage, "profile_pics/" + user.uid + ".jpg");
    await uploadBytes(fileRef, file);
    const url = await getDownloadURL(fileRef);

    // Update auth profile
    await updateProfile(user, { photoURL: url });

    // Save to database
    await update(ref(db, "users/" + user.uid), { profilePic: url });

    profilePic.src = url;
    alert("Profile picture updated!");
  };
  fileInput.click();
});

// Handle form submission
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const user = auth.currentUser;
  if (!user) return;

  const updates = {
    firstName: firstNameInput.value.trim(),
    lastName: lastNameInput.value.trim(),
    bio: bioInput.value.trim(),
    location: locationInput.value.trim(),
    role: roleInput.value.trim()
  };

  await update(ref(db, "users/" + user.uid), updates);

  alert("Profile updated successfully!");
});
