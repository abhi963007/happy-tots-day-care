// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAmRdHLYvWTStPsoWVG_DlkO5du3ahY6-Q",
  authDomain: "happy-tots-day-care.firebaseapp.com",
  projectId: "happy-tots-day-care",
  storageBucket: "happy-tots-day-care.appspot.com",
  messagingSenderId: "870240273343",
  appId: "1:870240273343:web:2c19be7acacef4a7c1970a"
};

// Initialize Firebase
let app;
try {
  app = firebase.initializeApp(firebaseConfig);
} catch (err) {
  console.error("Firebase initialization error", err);
  throw new Error("Failed to initialize Firebase");
}

const db = firebase.firestore(); // Note: This uses the namespaced API. Consider the modular SDK for newer apps!
const auth = firebase.auth();     // Note: This uses the namespaced API. Consider the modular SDK for newer apps!
const storage = firebase.storage(); // Note: This uses the namespaced API. Consider the modular SDK for newer apps!


// Firestore collections reference
const collections = {
  USERS: 'users',
  BLOG_POSTS: 'blogPosts',
  ENQUIRIES: 'enquiries',
  GALLERY: 'gallery'
};

// Export services
window.firebaseServices = {
  db,
  auth,
  storage,
  collections
};