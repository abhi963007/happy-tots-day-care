// Script to remove Webflow badge
(function() {
  // Function to remove the Webflow badge
  function removeWebflowBadge() {
    // Find all elements with class 'w-webflow-badge'
    const badges = document.querySelectorAll('.w-webflow-badge');
    
    // Remove each badge
    badges.forEach(badge => {
      if (badge && badge.parentNode) {
        badge.parentNode.removeChild(badge);
      }
    });
    
    // Also try to find any badges that might have been added dynamically
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.addedNodes) {
          mutation.addedNodes.forEach(node => {
            if (node.classList && node.classList.contains('w-webflow-badge')) {
              node.parentNode.removeChild(node);
            }
            
            // Check if it contains badges as children
            if (node.querySelectorAll) {
              const nestedBadges = node.querySelectorAll('.w-webflow-badge');
              nestedBadges.forEach(badge => {
                badge.parentNode.removeChild(badge);
              });
            }
          });
        }
      });
    });
    
    // Start observing the document
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  // Run when DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', removeWebflowBadge);
  } else {
    removeWebflowBadge();
  }
  
  // Also run after window loads (for any lazy-loaded badges)
  window.addEventListener('load', removeWebflowBadge);
})(); 