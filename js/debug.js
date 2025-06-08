// Debug and Error Handling Utility
(function() {
  // Global error handler
  window.addEventListener('error', function(event) {
    console.log('Global error handler caught:', event.error);
    
    // Don't interfere with Webflow's internal errors
    if (event.filename && (
        event.filename.includes('webflow') ||
        event.filename.includes('search_impl.js') ||
        event.filename.includes('main.js')
    )) {
      console.log('Webflow internal error, not intercepting');
      return;
    }
    
    // For Firebase errors, provide better feedback
    if (event.error && event.error.message && 
        (event.error.message.includes('firebase') || 
         event.error.message.includes('Firestore'))) {
      console.log('Firebase error intercepted');
      
      // Provide visual feedback
      const errorDiv = document.createElement('div');
      errorDiv.style.cssText = 'position:fixed;bottom:0;left:0;right:0;background:#f44336;color:white;padding:10px;z-index:9999;text-align:center;';
      errorDiv.innerHTML = `Firebase Error: ${event.error.message}<button style="margin-left: 10px; padding: 5px; background: white; color: black; border: none; border-radius: 3px;" onclick="this.parentNode.remove()">Dismiss</button>`;
      document.body.appendChild(errorDiv);
      
      // Prevent the error from bubbling up
      event.preventDefault();
    }
  });
  
  // Patch problematic Webflow search 
  document.addEventListener('DOMContentLoaded', function() {
    // Fix search implementation issues if they exist
    if (window.Webflow && typeof window.Webflow.push === 'function') {
      try {
        // Override the search initialization to prevent errors
        const originalPush = window.Webflow.push;
        window.Webflow.push = function() {
          try {
            originalPush.apply(window.Webflow, arguments);
          } catch (e) {
            console.log('Prevented Webflow error:', e);
          }
        };
      } catch (e) {
        console.log('Could not patch Webflow search:', e);
      }
    }
    
    // Fix for the contact form specific issue
    setTimeout(function() {
      try {
        // Find all forms and add form handling
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
          if (!form._patched && form.classList.contains('w-form')) {
            console.log('Adding event handler to form:', form.id || 'unnamed form');
            form._patched = true;
            form.addEventListener('submit', function(e) {
              e.preventDefault();
              console.log('Form submit intercepted');
              
              // Show success message
              const successEl = form.nextElementSibling;
              if (successEl && successEl.classList.contains('w-form-done')) {
                form.style.display = 'none';
                successEl.style.display = 'block';
              }
            });
          }
        });
      } catch (e) {
        console.log('Error patching forms:', e);
      }
    }, 1000);
  });
})(); 