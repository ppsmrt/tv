import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB9GaCbYFH22WbiLs1pc_UJTsM_0Tetj6E",
  authDomain: "tnm3ulive.firebaseapp.com",
  databaseURL: "https://tnm3ulive-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "tnm3ulive",
  storageBucket: "tnm3ulive.appspot.com",
  messagingSenderId: "80664356882",
  appId: "1:80664356882:web:c8464819b0515ec9b210cb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// Persist login
setPersistence(auth, browserLocalPersistence);

// Redirect if already logged in
onAuthStateChanged(auth, async (user) => {
  if(user){
    const adminRef = ref(db, "admins/" + user.uid);
    const adminSnapshot = await get(adminRef);
    window.location.href = adminSnapshot.exists() ? "admin" : "/";
  }
});

// DOM elements
const signinForm = document.getElementById('signinForm');
const passwordInput = document.getElementById('password');
const togglePassword = document.getElementById('togglePassword');
const passwordStrength = document.getElementById('passwordStrength');
const strengthText = document.getElementById('strengthText');

// Show/Hide password
togglePassword.addEventListener('click', () => {
  const type = passwordInput.type === 'password' ? 'text' : 'password';
  passwordInput.type = type;
  togglePassword.innerHTML = `<span class="material-icons">${type === 'password' ? 'visibility' : 'visibility_off'}</span>`;
});

// Password strength meter
passwordInput.addEventListener('input', () => {
  const val = passwordInput.value;
  let strength = 0;
  if(val.length >= 6) strength++;
  if(/[A-Z]/.test(val)) strength++;
  if(/[0-9]/.test(val)) strength++;
  if(/[^A-Za-z0-9]/.test(val)) strength++;

  let width = (strength / 4) * 100 + "%";
  passwordStrength.style.width = width;

  switch(strength){
    case 0:
    case 1:
      passwordStrength.style.background = "red";
      strengthText.textContent = "Weak";
      break;
    case 2:
      passwordStrength.style.background = "orange";
      strengthText.textContent = "Medium";
      break;
    case 3:
      passwordStrength.style.background = "yellowgreen";
      strengthText.textContent = "Strong";
      break;
    case 4:
      passwordStrength.style.background = "green";
      strengthText.textContent = "Very Strong";
      break;
  }
});

// Sign-in form submit
signinForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = passwordInput.value.trim();

  signInWithEmailAndPassword(auth, email, password)
    .then(async (userCredential) => {
      const user = userCredential.user;
      const adminRef = ref(db, "admins/" + user.uid);
      const adminSnapshot = await get(adminRef);
      window.location.href = adminSnapshot.exists() ? "admin" : "/";
    })
    .catch((error) => {
      alert("Login failed: " + error.message);
    });
});
