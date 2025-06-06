// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
const storage = firebase.storage();

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
