// Admin Dashboard Functions
(async function() {
  // Verify admin status
  auth.onAuthStateChanged(async user => {
    if (!user) {
      window.location.href = '../contact.html';
      return;
    }
    
    // Check admin claim
    const token = await user.getIdTokenResult();
    if (!token.claims.admin) {
      alert('Access denied - admin privileges required');
      window.location.href = '../index.html';
      return;
    }
    
    // Load admin content
    loadUserStats();
    renderUserTable();
  });
  
  async function loadUserStats() {
    const snapshot = await firebaseServices.db
      .collection(firebaseServices.collections.USERS)
      .get();
    
    document.getElementById('user-stats').innerHTML = `
      <h3>User Statistics</h3>
      <p>Total Users: ${snapshot.size}</p>
    `;
  }
  
  async function getAllUsers() {
    const snapshot = await firebaseServices.db
      .collection(firebaseServices.collections.USERS)
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
  
  async function renderUserTable() {
    const users = await getAllUsers();
    
    const tableHTML = `
      <table style="width: 100%; border-collapse: collapse; margin-top: 1rem;">
        <thead>
          <tr style="background: #f5f5f5;">
            <th style="padding: 0.5rem; text-align: left;">Name</th>
            <th style="padding: 0.5rem; text-align: left;">Email</th>
            <th style="padding: 0.5rem; text-align: left;">Provider</th>
            <th style="padding: 0.5rem; text-align: left;">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${users.map(user => `
            <tr style="border-bottom: 1px solid #ddd;">
              <td style="padding: 0.5rem;">${user.name || 'N/A'}</td>
              <td style="padding: 0.5rem;">${user.email}</td>
              <td style="padding: 0.5rem;">${user.provider || 'email'}</td>
              <td style="padding: 0.5rem;">
                <button onclick="manageUser('${user.id}')" style="padding: 0.25rem 0.5rem;">Manage</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    
    document.getElementById('admin-content').innerHTML += tableHTML;
  }
  
  async function manageUser(userId) {
    const user = await dataService.getDoc(firebaseServices.collections.USERS, userId);
    
    const modalHTML = `
      <div class="modal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center;">
        <div style="background: white; padding: 2rem; border-radius: 8px; width: 80%; max-width: 500px;">
          <h2>Manage User: ${user.email}</h2>
          <div style="margin: 1rem 0;">
            <label>Admin Privileges:</label>
            <input type="checkbox" id="admin-toggle" ${user.admin ? 'checked' : ''}>
          </div>
          <button onclick="saveUserChanges('${userId}')">Save</button>
          <button onclick="closeModal()">Cancel</button>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }
  
  async function saveUserChanges(userId) {
    try {
      const isAdmin = document.getElementById('admin-toggle').checked;
      await dataService.updateDoc(firebaseServices.collections.USERS, userId, { admin: isAdmin });
      closeModal();
      document.getElementById('auth-message').textContent = 'User updated successfully';
      document.getElementById('auth-message').style.color = 'green';
      renderUserTable();
    } catch (error) {
      document.getElementById('auth-message').textContent = 'Error updating user: ' + error.message;
      document.getElementById('auth-message').style.color = 'red';
    }
  }
  
  function closeModal() {
    document.querySelector('.modal')?.remove();
  }
})();
