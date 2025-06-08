// Authentication Service
const authInstance = firebaseServices.auth;

// User Registration
async function registerUser(email, password, name) {
  try {
    const userCredential = await authInstance.createUserWithEmailAndPassword(email, password);
    await firebaseServices.db.collection(firebaseServices.collections.USERS)
      .doc(userCredential.user.uid)
      .set({ name, email, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
    
    // Send verification email
    await sendVerificationEmail();
    
    return userCredential.user;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}

// User Login
async function loginUser(email, password) {
  try {
    const userCredential = await authInstance.signInWithEmailAndPassword(email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

// Password Reset
async function sendPasswordReset(email) {
  try {
    await authInstance.sendPasswordResetEmail(email);
    return true;
  } catch (error) {
    console.error('Password reset error:', error);
    throw error;
  }
}

// Email Verification
async function sendVerificationEmail() {
  try {
    await authInstance.currentUser.sendEmailVerification();
    return true;
  } catch (error) {
    console.error('Verification email error:', error);
    throw error;
  }
}

// Google Sign-In
async function signInWithGoogle() {
  try {
    const provider = new firebase.auth.GoogleAuthProvider();
    const result = await authInstance.signInWithPopup(provider);
    
    // Check if new user
    if (result.additionalUserInfo.isNewUser) {
      await firebaseServices.db.collection(firebaseServices.collections.USERS)
        .doc(result.user.uid)
        .set({
          name: result.user.displayName,
          email: result.user.email,
          provider: 'google',
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    }
    
    return result.user;
  } catch (error) {
    console.error('Google sign-in error:', error);
    throw error;
  }
}

// Export functions
window.authService = { 
  registerUser, 
  loginUser,
  sendPasswordReset,
  sendVerificationEmail,
  signInWithGoogle
};
