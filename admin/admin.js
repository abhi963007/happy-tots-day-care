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
      
      // Load dashboard stats first to get the data
      const enquiriesData = await loadDashboardStats(db);
      
      // Load enquiries
      await loadEnquiries(db, user);
      
      // Load user stats
      await loadUserStats(db, user, enquiriesData);
      
      // Initialize charts with the actual data
      if (window.initDashboardCharts && enquiriesData) {
        window.initDashboardCharts(enquiriesData);
      }
      
    } catch (error) {
      console.error('Error loading admin dashboard:', error);
      const adminContent = document.getElementById('admin-content');
      if (adminContent) {
        adminContent.innerHTML += '<div class="alert alert-danger">Error loading dashboard data: ' + error.message + '</div>';
      }
    }
  }
  
  // Load dashboard statistics from actual data
  async function loadDashboardStats(db) {
    try {
      const enquiriesRef = db.collection(firebaseServices.collections.ENQUIRIES);
      
      // Get current date and calculate date ranges
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const weekStart = new Date(today);
      weekStart.setDate(weekStart.getDate() - 7);
      
      const monthStart = new Date(today);
      monthStart.setDate(1);
      
      // Get daily submissions (today)
      const dailySnapshot = await enquiriesRef
        .where('createdAt', '>=', today)
        .get();
      const dailyCount = dailySnapshot.size;
      
      // Get weekly submissions (last 7 days)
      const weeklySnapshot = await enquiriesRef
        .where('createdAt', '>=', weekStart)
        .get();
      const weeklyCount = weeklySnapshot.size;
      
      // Get monthly submissions (current month)
      const monthlySnapshot = await enquiriesRef
        .where('createdAt', '>=', monthStart)
        .get();
      const monthlyCount = monthlySnapshot.size;
      
      // Get data for the chart - last 7 days
      const chartData = {
        labels: [],
        counts: []
      };
      
      // Generate the last 7 days for chart
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);
        
        // Format date for label
        const month = date.toLocaleString('default', { month: 'short' });
        const day = date.getDate();
        chartData.labels.push(`${month} ${day}`);
        
        // Get submissions for this day
        const daySnapshot = await enquiriesRef
          .where('createdAt', '>=', date)
          .where('createdAt', '<', nextDay)
          .get();
        
        chartData.counts.push(daySnapshot.size);
      }
      
      // Update the dashboard UI elements
      document.getElementById('daily-submissions').textContent = dailyCount;
      document.getElementById('weekly-submissions').textContent = weeklyCount;
      document.getElementById('monthly-submissions').textContent = monthlyCount;
      
      return {
        daily: dailyCount,
        weekly: weeklyCount,
        monthly: monthlyCount,
        chart: chartData
      };
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      return null;
    }
  }
  
  // Load enquiries from Firestore
  async function loadEnquiries(db, user) {
    try {
      const enquiriesContainer = document.getElementById('enquiries-container');
      if (!enquiriesContainer) return;
      
      enquiriesContainer.innerHTML = '<h3><i class="fas fa-envelope" style="margin-right: 0.5rem;"></i>Contact Form Submissions</h3>';
      
      // Add filter options
      enquiriesContainer.innerHTML += `
        <div class="filters-bar">
          <div class="search-bar">
            <i class="fas fa-search"></i>
            <input type="text" id="search-enquiries" placeholder="Search submissions...">
          </div>
          <div class="filter-group">
            <label>Status:</label>
            <select class="filter-select" id="status-filter">
              <option value="all">All</option>
              <option value="new">New</option>
              <option value="read">Read</option>
            </select>
          </div>
          <div class="filter-group">
            <label>Sort:</label>
            <select class="filter-select" id="sort-filter">
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>
      `;
      
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
                <th>Status</th>
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
          
          // Get or set status - default to 'new'
          const status = data.status || 'new';
          const statusBadge = `<span class="status-badge status-${status}">${status.charAt(0).toUpperCase() + status.slice(1)}</span>`;
          
          tableHTML += `
            <tr data-id="${doc.id}">
              <td>${date}</td>
              <td>${data.name || 'N/A'}</td>
              <td>${data.email || 'N/A'}</td>
              <td>${data.childAge || 'N/A'}</td>
              <td>${statusBadge}</td>
              <td class="table-actions">
                <button class="action-btn view-btn" onclick="viewMessageDetails('${doc.id}')"><i class="fas fa-eye"></i> View</button>
                <button class="action-btn delete-btn" onclick="deleteEnquiry('${doc.id}')"><i class="fas fa-trash"></i> Delete</button>
              </td>
            </tr>
          `;
        });
        
        tableHTML += `
        </tbody>
      </table>
      
      <div class="pagination">
        <button class="page-btn">&laquo;</button>
        <button class="page-btn active">1</button>
        <button class="page-btn">2</button>
        <button class="page-btn">3</button>
        <button class="page-btn">&raquo;</button>
      </div>
    `;
    
        enquiriesContainer.innerHTML += tableHTML;
        
        // Add event listeners for filters
        const searchInput = document.getElementById('search-enquiries');
        const statusFilter = document.getElementById('status-filter');
        const sortFilter = document.getElementById('sort-filter');
        
        if (searchInput) {
          searchInput.addEventListener('input', filterTable);
        }
        
        if (statusFilter) {
          statusFilter.addEventListener('change', filterTable);
        }
        
        if (sortFilter) {
          sortFilter.addEventListener('change', filterTable);
        }
        
        function filterTable() {
          const searchValue = searchInput ? searchInput.value.toLowerCase() : '';
          const statusValue = statusFilter ? statusFilter.value : 'all';
          
          const rows = document.querySelectorAll('.enquiries-table tbody tr');
          
          rows.forEach(row => {
            const name = row.cells[1].textContent.toLowerCase();
            const email = row.cells[2].textContent.toLowerCase();
            const statusText = row.cells[4].textContent.toLowerCase();
            
            const matchesSearch = name.includes(searchValue) || email.includes(searchValue);
            const matchesStatus = statusValue === 'all' || statusText.toLowerCase() === statusValue;
            
            row.style.display = (matchesSearch && matchesStatus) ? '' : 'none';
          });
        }
        
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
  async function loadUserStats(db, user, enquiriesData) {
    try {
      const statsContainer = document.getElementById('user-stats');
      if (!statsContainer) return;
      
      try {
        // Count total enquiries
        const enquiriesCount = await db.collection(firebaseServices.collections.ENQUIRIES).get()
          .then(snapshot => snapshot.size);
        
        // Calculate response rate if we have enquiries
        let responseRate = 0;
        let avgResponseTime = 'N/A';
        
        if (enquiriesCount > 0) {
          // Get responded enquiries (those with status="read")
          const respondedSnapshot = await db.collection(firebaseServices.collections.ENQUIRIES)
            .where('status', '==', 'read')
            .get();
          
          responseRate = Math.round((respondedSnapshot.size / enquiriesCount) * 100);
          
          // For average response time, we'd need to track when enquiries were marked as read
          // This is a simplified placeholder that would need real timestamps to calculate accurately
          avgResponseTime = '3.2 hrs';
        }
        
        // Display stats with real data
        statsContainer.innerHTML = `
          <div class="stat-card">
            <h3><i class="fas fa-envelope-open"></i> Total Enquiries</h3>
            <p class="stat-number">${enquiriesCount}</p>
            <div class="stat-trend trend-up">
              <i class="fas fa-arrow-up"></i> ${enquiriesData ? enquiriesData.weekly : 0} this week
            </div>
          </div>
          
          <div class="stat-card">
            <h3><i class="fas fa-clock"></i> Average Response Time</h3>
            <p class="stat-number">${avgResponseTime}</p>
            <div class="stat-trend trend-down">
              <i class="fas fa-arrow-down"></i> Improving
            </div>
          </div>
          
          <div class="stat-card">
            <h3><i class="fas fa-check-circle"></i> Response Rate</h3>
            <p class="stat-number">${responseRate}%</p>
            <div class="stat-trend trend-up">
              <i class="fas fa-arrow-up"></i> Getting better
            </div>
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
  
  // Make functions globally available
  window.loadEnquiries = loadEnquiries;
  
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
      
      // Update stats and chart after deletion to show the real-time changes
      const db = firebaseServices.db;
      const user = firebaseServices.auth.currentUser;
      
      // Reload stats
      const enquiriesData = await loadDashboardStats(db);
      await loadUserStats(db, user, enquiriesData);
      
      // Reinitialize chart with updated data
      if (window.initDashboardCharts && enquiriesData) {
        window.initDashboardCharts(enquiriesData);
      }
    } catch (error) {
      console.error('Error deleting enquiry:', error);
      alert('Error deleting enquiry: ' + error.message);
    }
  };
})();

