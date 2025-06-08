// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBs1J_p5KF73e0lXccacgooGD0AXqL21y0",
  authDomain: "happy-tots-day-care-ab4c5.firebaseapp.com",
  projectId: "happy-tots-day-care-ab4c5",
  storageBucket: "happy-tots-day-care-ab4c5.firebasestorage.app",
  messagingSenderId: "797588976469",
  appId: "1:797588976469:web:beb96581e277b8f12075dc",
  measurementId: "G-DMTBT1KCNH"
};

// Initialize Firebase
let app;
let db;
let auth;
let storage;
let collections;

// Check for Firebase SDK
if (typeof firebase === 'undefined') {
  console.error("Firebase SDK is not loaded. Check script tags in HTML.");
  // Create a placeholder to prevent errors
  window.firebaseServices = {
    db: null,
    auth: null,
    storage: null,
    collections: null,
    isInitialized: false
  };
} else {
  try {
    // Initialize Firebase app
    try {
      app = firebase.initializeApp(firebaseConfig);
    } catch (err) {
      // Check if already initialized (happens when included on multiple pages)
      if (err.code === 'app/duplicate-app') {
        app = firebase.app(); // Use existing app
        console.log("Using existing Firebase app");
      } else {
        throw err; // Rethrow if it's a different error
      }
    }

    // Initialize services
    db = firebase.firestore();
    auth = firebase.auth();
    storage = firebase.storage();

    // Firestore collections reference
    collections = {
      USERS: 'users',
      BLOG_POSTS: 'blogPosts',
      ENQUIRIES: 'enquiries',
      GALLERY: 'gallery',
      NEWSLETTER: 'newsletter'
    };

    // Export services
    window.firebaseServices = {
      db,
      auth,
      storage,
      collections,
      isInitialized: true
    };

    console.log("Firebase services initialized successfully");
  } catch (err) {
    console.error("Firebase initialization error", err);
    
    // Create a placeholder to prevent errors in other scripts
    window.firebaseServices = {
      db: null,
      auth: null,
      storage: null,
      collections: null,
      isInitialized: false,
      error: err.message
    };
    
    // Add error message to page if in development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      document.addEventListener('DOMContentLoaded', function() {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = 'position:fixed;bottom:0;left:0;right:0;background:#f44336;color:white;padding:10px;z-index:9999;text-align:center;';
        errorDiv.innerHTML = `Firebase Error: ${err.message}`;
        document.body.appendChild(errorDiv);
      });
    }
  }
}