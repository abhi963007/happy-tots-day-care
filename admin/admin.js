// Admin Dashboard Functions
(function() {
  // Verify admin status
  document.addEventListener('DOMContentLoaded', function() {
    // Check if Firebase services are available
    if (!window.firebaseServices || !window.firebaseServices.auth) {
      console.error('Firebase services not initialized properly');
      const userStats = document.getElementById('user-stats');
      if (userStats) {
        userStats.innerHTML = '<h3>Error</h3><p>Firebase services not initialized. Please check console for details.</p>';
      }
      return;
    }
    
    const authInstance = firebaseServices.auth;
    const db = firebaseServices.db;
    
    // Show login form initially
    const adminLoader = document.getElementById('admin-loader');
    const loginSection = document.getElementById('login-section');
    
    if (adminLoader) adminLoader.style.display = 'none';
    if (loginSection) loginSection.style.display = 'block';
    
    // Handle login form submission
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const errorMsg = document.getElementById('login-error');
        const loginBtn = document.getElementById('login-btn');
        
        try {
          if (errorMsg) errorMsg.textContent = '';
          if (loginBtn) {
            loginBtn.disabled = true;
            loginBtn.textContent = 'Logging in...';
          }
          
          await authInstance.signInWithEmailAndPassword(email, password);
          // Auth state listener will handle the rest
        } catch (error) {
          console.error('Login error:', error);
          if (errorMsg) errorMsg.textContent = error.message;
          if (loginBtn) {
            loginBtn.disabled = false;
            loginBtn.textContent = 'Login';
          }
        }
      });
    }
    
    // Handle demo login (for testing)
    const demoLoginBtn = document.getElementById('demo-login');
    if (demoLoginBtn) {
      demoLoginBtn.addEventListener('click', async () => {
        try {
          // First create a test user if it doesn't exist
          try {
            await authInstance.createUserWithEmailAndPassword('admin@example.com', 'admin123');
            console.log('Created demo admin user');
            
            // Also create a user document in Firestore for this admin
            try {
              await db.collection('users').doc(authInstance.currentUser.uid).set({
                email: 'admin@example.com',
                role: 'admin',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
              });
              console.log('Created admin user document in Firestore');
            } catch (err) {
              console.log('Could not create user document, might already exist:', err);
            }
            
          } catch (e) {
            // User might already exist, which is fine
            console.log('Demo user might already exist:', e.message);
          }
          
          // Now login with the demo user
          await authInstance.signInWithEmailAndPassword('admin@example.com', 'admin123');
        } catch (error) {
          console.error('Demo login error:', error);
          const errorMsg = document.getElementById('login-error');
          if (errorMsg) errorMsg.textContent = error.message;
        }
      });
    }

    authInstance.onAuthStateChanged(async user => {
      if (!user) {
        // User is not logged in, show login form
        const adminLoader = document.getElementById('admin-loader');
        const loginSection = document.getElementById('login-section');
        const adminHeader = document.getElementById('admin-header');
        const adminContent = document.getElementById('admin-content');
        
        if (adminLoader) adminLoader.style.display = 'none';
        if (loginSection) loginSection.style.display = 'block';
        if (adminHeader) adminHeader.style.display = 'none';
        if (adminContent) adminContent.style.display = 'none';
        return;
      }
      
      // User is logged in, hide login form
      const loginSection = document.getElementById('login-section');
      if (loginSection) loginSection.style.display = 'none';
      
      try {
        // Check admin claim
        const token = await user.getIdTokenResult();
        if (!token.claims.admin && user.email !== 'abhiramak963@gmail.com' && user.email !== 'admin@example.com') {
          // For development: automatically make these emails an admin
          if (user.email === 'abhiramak963@gmail.com' || user.email === 'admin@example.com') {
            // This won't actually work in the client, but it's here for reference
            // You would need to do this server-side with Firebase Functions or Admin SDK
            console.log('Dev mode: This user would be made admin server-side');
            loadAdminDashboard(user, db);
          } else {
            const adminContent = document.getElementById('admin-content');
            const adminLoader = document.getElementById('admin-loader');
            const adminHeader = document.getElementById('admin-header');
            
            if (adminContent) adminContent.innerHTML = '<h3>Access Denied</h3><p>You do not have admin privileges.</p>';
            if (adminLoader) adminLoader.style.display = 'none';
            
            // Show logout button
            if (adminHeader) adminHeader.style.display = 'flex';
          }
        } else {
          // User is admin, load dashboard
          loadAdminDashboard(user, db);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        const adminContent = document.getElementById('admin-content');
        const adminLoader = document.getElementById('admin-loader');
        
        if (adminContent) adminContent.innerHTML = '<h3>Error</h3><p>Failed to verify admin status: ' + error.message + '</p>';
        if (adminLoader) adminLoader.style.display = 'none';
      }
    });

    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        authInstance.signOut().then(() => {
          console.log('User signed out');
          // Let the auth state listener handle the UI
        }).catch(error => {
          console.error('Error signing out:', error);
        });
      });
    }
  });

  // Load admin dashboard content
  async function loadAdminDashboard(user, db) {
    try {
      const adminName = document.getElementById('admin-name');
      const adminEmail = document.getElementById('admin-email');
      const adminLoader = document.getElementById('admin-loader');
      const adminHeader = document.getElementById('admin-header');
      const adminContent = document.getElementById('admin-content');
      
      if (adminName) adminName.textContent = user.displayName || user.email;
      if (adminEmail) adminEmail.textContent = user.email;
      
      // Show admin sections
      if (adminLoader) adminLoader.style.display = 'none';
      if (adminHeader) adminHeader.style.display = 'flex';
      if (adminContent) adminContent.style.display = 'block';
      
      // Load enquiries
      await loadEnquiries(db, user);
      
      // Load user stats
      await loadUserStats(db, user);
      
    } catch (error) {
      console.error('Error loading admin dashboard:', error);
      const adminContent = document.getElementById('admin-content');
      if (adminContent) {
        adminContent.innerHTML += '<div class="alert alert-danger">Error loading dashboard data: ' + error.message + '</div>';
      }
    }
  }
  
  // Load enquiries from Firestore
  async function loadEnquiries(db, user) {
    try {
      const enquiriesContainer = document.getElementById('enquiries-container');
      if (!enquiriesContainer) return;
      
      enquiriesContainer.innerHTML = '<h3>Contact Form Submissions</h3>';
      
      // Skip the test data creation, just check permissions
      try {
        // Try to get the collections (will fail if permissions aren't set up)
        let testSnapshot = await db.collection(firebaseServices.collections.ENQUIRIES).limit(1).get();
      } catch (err) {
        console.warn('Could not access enquiries:', err);
        enquiriesContainer.innerHTML += `<p>Error: Insufficient permissions to access enquiries. 
          This is likely due to Firebase security rules. Please make sure the current user (${user.email}) 
          has proper permissions set in Firebase Console.</p>`;
        return;
      }
      
      // Get enquiries collection
      try {
        const enquiriesSnapshot = await db.collection(firebaseServices.collections.ENQUIRIES)
          .orderBy('createdAt', 'desc')
          .limit(20)
      .get();
        
        if (enquiriesSnapshot.empty) {
          enquiriesContainer.innerHTML += '<p>No submissions yet.</p>';
          return;
        }
        
        // Create table
        let tableHTML = `
          <table class="enquiries-table">
        <thead>
              <tr>
                <th>Date</th>
                <th>Name</th>
                <th>Email</th>
                <th>Child Age</th>
                <th>Message</th>
                <th>Actions</th>
          </tr>
        </thead>
        <tbody>
        `;
        
        // Add rows
        enquiriesSnapshot.forEach(doc => {
          const data = doc.data();
          let date = 'Unknown';
          
          try {
            date = data.createdAt && data.createdAt.toDate ? 
                  new Date(data.createdAt.toDate()).toLocaleString() : 
                  data.createdAt ? new Date(data.createdAt).toLocaleString() : 'Unknown';
          } catch (e) {
            console.warn('Error formatting date:', e);
          }
          
          tableHTML += `
            <tr data-id="${doc.id}">
              <td>${date}</td>
              <td>${data.name || 'N/A'}</td>
              <td>${data.email || 'N/A'}</td>
              <td>${data.childAge || 'N/A'}</td>
              <td class="message-cell">${data.message || 'N/A'}</td>
              <td>
                <button class="delete-btn" onclick="deleteEnquiry('${doc.id}')">Delete</button>
              </td>
            </tr>
          `;
        });
        
        tableHTML += `
        </tbody>
      </table>
    `;
    
        enquiriesContainer.innerHTML += tableHTML;
      } catch (error) {
        console.error('Error loading enquiries:', error);
        enquiriesContainer.innerHTML += '<p>Error loading submissions: ' + error.message + '</p>';
      }
    } catch (error) {
      console.error('Error in loadEnquiries function:', error);
      const enquiriesContainer = document.getElementById('enquiries-container');
      if (enquiriesContainer) {
        enquiriesContainer.innerHTML += '<p>Error loading submissions: ' + error.message + '</p>';
      }
    }
  }
  
  // Load user statistics
  async function loadUserStats(db, user) {
    try {
      const statsContainer = document.getElementById('user-stats');
      if (!statsContainer) return;
      
      try {
        // Count enquiries
        const enquiriesCount = await db.collection(firebaseServices.collections.ENQUIRIES).get()
          .then(snapshot => snapshot.size);
        
        // Count users (if you have user collection)
        let usersCount = 0;
        try {
          usersCount = await db.collection(firebaseServices.collections.USERS).get()
            .then(snapshot => snapshot.size);
        } catch (e) {
          console.log('No users collection or access denied');
        }
        
        // Display stats
        statsContainer.innerHTML = `
          <div class="stat-card">
            <h3>Enquiries</h3>
            <p class="stat-number">${enquiriesCount}</p>
          </div>
          <div class="stat-card">
            <h3>Users</h3>
            <p class="stat-number">${usersCount}</p>
      </div>
    `;
      } catch (error) {
        console.error('Error fetching statistics:', error);
        statsContainer.innerHTML = `<p>Error: Insufficient permissions to access statistics. 
          This is likely due to Firebase security rules. Please make sure the current user (${user.email}) 
          has proper permissions set in Firebase Console.</p>`;
      }
    } catch (error) {
      console.error('Error in loadUserStats function:', error);
      const statsContainer = document.getElementById('user-stats');
      if (statsContainer) {
        statsContainer.innerHTML = '<p>Error loading statistics: ' + error.message + '</p>';
      }
    }
  }
  
  // Make deleteEnquiry function globally available
  window.deleteEnquiry = async function(docId) {
    if (!confirm('Are you sure you want to delete this enquiry?')) {
      return;
    }
    
    try {
      await firebaseServices.db.collection(firebaseServices.collections.ENQUIRIES).doc(docId).delete();
      const row = document.querySelector(`tr[data-id="${docId}"]`);
      if (row) row.remove();
      alert('Enquiry deleted successfully');
      
      // Update stats after deletion
      const statsContainer = document.getElementById('user-stats');
      if (statsContainer) {
        try {
          const enquiriesCount = await firebaseServices.db.collection(firebaseServices.collections.ENQUIRIES).get()
            .then(snapshot => snapshot.size);
          
          // Update just the enquiries count
          const enquiriesCountElement = statsContainer.querySelector('.stat-card:first-child .stat-number');
          if (enquiriesCountElement) {
            enquiriesCountElement.textContent = enquiriesCount;
          }
        } catch (e) {
          console.error('Could not update stats after deletion:', e);
        }
      }
    } catch (error) {
      console.error('Error deleting enquiry:', error);
      alert('Error deleting enquiry: ' + error.message);
    }
  };
})();

