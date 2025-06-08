// Contact Form Handler
document.addEventListener('DOMContentLoaded', function() {
  console.log('Contact form handler initialized');
  
  // Check if Firebase services are available
  if (!window.firebaseServices || !window.firebaseServices.isInitialized) {
    console.error('Firebase services not initialized properly');
    return;
  }
  
  // Set up contact form submission
  // Try different selectors to find the form
  const contactForm = document.getElementById('wf-form-Contact-Us-Form') || 
                      document.querySelector('form[name="wf-form-Contact-Us-Form"]') ||
                      document.querySelector('.w-form form');
  
  if (contactForm) {
    console.log('Found contact form:', contactForm.id || 'unnamed form');
    
    contactForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      console.log('Form submitted, processing...');
      
      try {
        const nameInput = document.getElementById('Contact-Us-Name-3');
        const ageInput = document.getElementById('Contact-Us-Age-3');
        const emailInput = document.getElementById('Contact-Us-Email-3');
        const messageInput = document.getElementById('Contact-Message-3');
        
        if (!nameInput || !ageInput || !emailInput || !messageInput) {
          console.error('Form fields not found');
          console.log('Available fields:', contactForm.elements);
          return;
        }
        
        const name = nameInput.value;
        const age = ageInput.value;
        const email = emailInput.value;
        const message = messageInput.value;
        
        console.log('Saving to Firestore:', { name, childAge: age, email });
        
        // Try direct Firestore API if dataService fails
        try {
          // First try with dataService
          await window.dataService.createDoc(window.firebaseServices.collections.ENQUIRIES, {
            name,
            childAge: age,
            email,
            message,
            createdAt: new Date().toISOString()
          });
          console.log('Successfully submitted form using dataService');
        } catch (serviceError) {
          console.error('Error using dataService, falling back to direct Firestore API:', serviceError);
          
          // Fall back to direct Firestore API
          const docRef = await window.firebaseServices.db.collection(window.firebaseServices.collections.ENQUIRIES).add({
            name,
            childAge: age,
            email,
            message,
            createdAt: new Date().toISOString(),
            createdAt_server: firebase.firestore.FieldValue.serverTimestamp()
          });
          
          console.log('Successfully submitted form using direct Firestore API. Document ID:', docRef.id);
        }
        
        // Show success message
        contactForm.style.display = 'none';
        const successMessage = document.querySelector('.w-form-done');
        if (successMessage) {
          successMessage.style.display = 'block';
        }
        console.log('Form submission successful');
      } catch (error) {
        console.error('Form submission error:', error);
        const errorMessage = document.querySelector('.w-form-fail');
        if (errorMessage) {
          errorMessage.style.display = 'block';
          errorMessage.textContent = 'Error: ' + error.message;
        }
        
        // Show detailed error
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = 'position:fixed;bottom:0;left:0;right:0;background:#f44336;color:white;padding:10px;z-index:9999;text-align:center;';
        errorDiv.innerHTML = `Firebase Error: ${error.message}<button style="margin-left: 10px; padding: 5px; background: white; color: black; border: none; border-radius: 3px;" onclick="this.parentNode.remove()">Dismiss</button>`;
        document.body.appendChild(errorDiv);
      }
    });
    
    console.log('Contact form handler attached');
  } else {
    console.error('Contact form not found');
    
    // Debug available forms
    console.log('Available forms on the page:');
    const allForms = document.querySelectorAll('form');
    allForms.forEach((form, index) => {
      console.log(`Form ${index}:`, {
        id: form.id,
        name: form.getAttribute('name'),
        className: form.className
      });
    });
  }
}); 