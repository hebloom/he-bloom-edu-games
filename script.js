import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


const firebaseConfig = {
  apiKey: "AIzaSyB0crUiSYBTxye5nHDOYJ8I7dNAv-mLO7g",
  authDomain: "he-bloom-edu-games.firebaseapp.com",
  projectId: "he-bloom-edu-games",
  storageBucket: "he-bloom-edu-games.firebasestorage.app",
  messagingSenderId: "629319143905",
  appId: "1:629319143905:web:2a989f47e473c4ad7302a0",
  measurementId: "G-JDLS6LDLEW"
};


const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

// =========================
// DEVICE ID
// =========================

let deviceId = localStorage.getItem("heBloomDeviceId");

if (!deviceId) {
  deviceId =
    "device_" +
    Date.now() +
    "_" +
    Math.random().toString(36).substring(2, 10);
  
  localStorage.setItem("heBloomDeviceId", deviceId);
}


const email = document.getElementById("email");
const password = document.getElementById("password");

const registerBtn = document.getElementById("registerBtn");
const loginBtn = document.getElementById("loginBtn");

const message = document.getElementById("message");

const forgotPassword = document.getElementById("forgotPassword");
const resetBox = document.getElementById("resetBox");
const resetEmail = document.getElementById("resetEmail");
const resetBtn = document.getElementById("resetBtn");
const backToLogin = document.getElementById("backToLogin");


// =========================
// CREATE ACCOUNT
// =========================

registerBtn.addEventListener("click", async () => {
  
  if (password.value.length < 6) {
    
    message.style.color = "red";
    
    message.textContent =
      "Password must be at least 6 characters.";
    
    return;
  }
  
  
  try {
    
    await createUserWithEmailAndPassword(
      auth,
      email.value,
      password.value
    );
    
    
    message.style.color = "green";
    
    message.textContent =
      "Account created successfully. Please wait for access activation.";
    
    
  } catch (error) {
    
    message.style.color = "red";
    
    message.textContent =
      error.message;
    
  }
  
});


// =========================
// LOGIN
// =========================

loginBtn.addEventListener("click", async () => {
  
  try {
    
    // LOGIN FIREBASE AUTH
    const userCredential =
      await signInWithEmailAndPassword(
        auth,
        email.value,
        password.value
      );
    
    
    const user = userCredential.user;
    
    
    // =========================
    // CHECK FIRESTORE USER
    // =========================
    
    const userRef =
      doc(db, "users", user.uid);
    
    const userSnap =
      await getDoc(userRef);
    
    
    // USER TIADA DALAM FIRESTORE
    if (!userSnap.exists()) {
      
      await signOut(auth);
      
      message.style.color = "red";
      
      message.textContent =
        "Your account does not have access yet.";
      
      return;
    }
    
    
    // AMBIL DATA USER
    const userData =
      userSnap.data();
   
   // =========================
// CHECK DEVICE LIMIT
// =========================

let devices = userData.devices || {};

if (!devices[deviceId]) {
  
  const deviceCount =
    Object.keys(devices).length;
  
  const maxDevices =
    userData.maxDevices || 4;
  
  if (deviceCount >= maxDevices) {
    
    await signOut(auth);
    
    message.style.color = "red";
    
    message.textContent =
      "Maximum 4 devices reached.";
    
    return;
  }
  
  devices[deviceId] = {
    addedAt: Date.now()
  };
await updateDoc(userRef, {
  devices: devices
});  
}


   
   console.log("USER UID:", user.uid);
console.log("USER DATA:", userData);
console.log("ACCESS:", userData.access);
    
    // CHECK ACCESS
    if (userData.access !== "free") {
      
      await signOut(auth);
      
      message.style.color = "red";
      
      message.textContent =
        "Your access is not active.";
      
      return;
    }
    
    
    // =========================
    // LOGIN BERJAYA
    // =========================
    
    message.style.color = "green";
    
    message.textContent =
      "Login was successful";
    
    
    setTimeout(() => {
      
      window.location.href =
        "dashboard.html";
      
    }, 1000);
    
    
  } catch (error) {
  
  console.error("LOGIN ERROR:", error);
  
  message.style.color = "red";
  
  message.textContent =
    error.code + " : " + error.message;
  
}
  
});


// =========================
// FORGOT PASSWORD
// =========================

forgotPassword.addEventListener("click", () => {
  
  forgotPassword.style.display = "none";
  
  document.querySelector(".buttons").style.display = "none";
  
  email.style.display = "none";
  
  password.style.display = "none";
  
  resetBox.style.display = "block";
  
  message.textContent = "";
  
});


// =========================
// SEND RESET LINK
// =========================

resetBtn.addEventListener("click", async () => {
  
  const resetEmailValue =
    resetEmail.value.trim();
  
  
  if (!resetEmailValue) {
    
    message.style.color = "red";
    
    message.textContent =
      "Please enter your email.";
    
    return;
  }
  
  
  try {
    
    await sendPasswordResetEmail(
      auth,
      resetEmailValue
    );
    
    
    message.style.color = "green";
    
    message.textContent =
      "Password reset link has been sent to your email.";
    
    
  } catch (error) {
    
    message.style.color = "red";
    
    
    if (error.code === "auth/invalid-email") {
      
      message.textContent =
        "Please enter a valid email.";
      
    } else {
      
      message.textContent =
        "Unable to send reset link.";
      
    }
    
  }
  
});


// =========================
// BACK TO LOGIN
// =========================

backToLogin.addEventListener("click", () => {
  
  resetBox.style.display = "none";
  
  forgotPassword.style.display = "block";
  
  document.querySelector(".buttons").style.display = "flex";
  
  email.style.display = "block";
  
  password.style.display = "block";
  
  resetEmail.value = "";
  
  message.textContent = "";
  
});



const togglePassword = document.getElementById("togglePassword");
const passwordInput = document.getElementById("password");

togglePassword.addEventListener("click", function () {

    if (passwordInput.type === "password") {

        passwordInput.type = "text";
        togglePassword.textContent = "🔓";

    } else {

        passwordInput.type = "password";
        togglePassword.textContent = "🔒";

    }

});
