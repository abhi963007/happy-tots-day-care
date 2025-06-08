// Contact Form Handler
document.addEventListener('DOMContentLoaded', function() {
  // Check if Firebase services are available
  if (!window.firebaseServices || !window.firebaseServices.isInitialized) {
    console.error('Firebase services not initialized properly');
    return;
  }
  
  // Set up contact form submission
  const contactForm = document.getElementById('wf-form-Contact-Us-Form') || 
                      document.querySelector('form[name="wf-form-Contact-Us-Form"]') ||
                      document.querySelector('.w-form form');
  
  if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      try {
        const nameInput = document.getElementById('Contact-Us-Name-3');
        const ageInput = document.getElementById('Contact-Us-Age-3');
        const emailInput = document.getElementById('Contact-Us-Email-3');
        const messageInput = document.getElementById('Contact-Message-3');
        
        if (!nameInput || !ageInput || !emailInput || !messageInput) {
          console.error('Form fields not found');
          return;
        }
        
        const name = nameInput.value;
        const age = ageInput.value;
        const email = emailInput.value;
        const message = messageInput.value;
        
        // Try using dataService with fallback to direct Firestore API
        try {
          await window.dataService.createDoc(window.firebaseServices.collections.ENQUIRIES, {
            name,
            childAge: age,
            email,
            message
          });
        } catch (serviceError) {
          // Fall back to direct Firestore API
          await window.firebaseServices.db.collection(window.firebaseServices.collections.ENQUIRIES).add({
            name,
            childAge: age,
            email,
            message,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
          });
        }
        
        // Show success message
        contactForm.style.display = 'none';
        const successMessage = document.querySelector('.w-form-done');
        if (successMessage) {
          successMessage.style.display = 'block';
        }
      } catch (error) {
        console.error('Form submission error:', error);
        const errorMessage = document.querySelector('.w-form-fail');
        if (errorMessage) {
          errorMessage.style.display = 'block';
        }
      }
    });
  } else {
    console.error('Contact form not found');
  }
}); 