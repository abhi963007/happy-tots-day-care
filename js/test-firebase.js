// Firebase Test and Diagnostic Script
console.log('Firebase test script loaded');

// Function to create a test document in Firestore
async function testFirestoreWrite() {
  console.log('Testing Firestore write operation...');
  
  try {
    if (!window.firebaseServices || !window.firebaseServices.db) {
      console.error('Firebase services not initialized properly');
      showDiagnosticMessage('Firebase not initialized', 'error');
      return false;
    }
    
    // Get collection reference
    const enquiriesCollection = window.firebaseServices.collections.ENQUIRIES;
    console.log('Using collection:', enquiriesCollection);
    
    // Try direct Firestore API access
    const docRef = await window.firebaseServices.db.collection(enquiriesCollection).add({
      name: 'Test User',
      email: 'test@example.com',
      message: 'This is a test submission from the diagnostic tool',
      childAge: '5',
      createdAt: new Date().toISOString(),
      testSubmission: true
    });
    
    console.log('Test document written with ID:', docRef.id);
    showDiagnosticMessage('Successfully wrote test data to Firestore! Doc ID: ' + docRef.id, 'success');
    return true;
  } catch (error) {
    console.error('Error writing test document to Firestore:', error);
    showDiagnosticMessage('Error writing to Firestore: ' + error.message, 'error');
    return false;
  }
}

// Function to test dataService
async function testDataService() {
  console.log('Testing dataService...');
  
  try {
    if (!window.dataService || !window.dataService.createDoc) {
      console.error('dataService not available or missing createDoc method');
      showDiagnosticMessage('dataService not properly initialized', 'error');
      return false;
    }
    
    // Get collection reference
    const enquiriesCollection = window.firebaseServices.collections.ENQUIRIES;
    
    // Use dataService to create a document
    const docId = await window.dataService.createDoc(enquiriesCollection, {
      name: 'Data Service Test',
      email: 'dataservice@example.com',
      message: 'This is a test using the dataService',
      childAge: '4',
      testSubmission: true
    });
    
    console.log('DataService test document written with ID:', docId);
    showDiagnosticMessage('Successfully used dataService to write data! Doc ID: ' + docId, 'success');
    return true;
  } catch (error) {
    console.error('Error using dataService:', error);
    showDiagnosticMessage('Error with dataService: ' + error.message, 'error');
    return false;
  }
}

// Function to show diagnostic messages in UI
function showDiagnosticMessage(message, type = 'info') {
  // Create or use existing diagnostic container
  let diagnosticContainer = document.getElementById('firebase-diagnostic-container');
  
  if (!diagnosticContainer) {
    diagnosticContainer = document.createElement('div');
    diagnosticContainer.id = 'firebase-diagnostic-container';
    diagnosticContainer.style.cssText = 'position:fixed;bottom:0;left:0;right:0;z-index:9999;padding:10px;font-family:sans-serif;';
    document.body.appendChild(diagnosticContainer);
  }
  
  // Create message element
  const messageEl = document.createElement('div');
  messageEl.style.cssText = 'margin-bottom:10px;padding:10px;border-radius:4px;';
  
  // Set background color based on message type
  if (type === 'error') {
    messageEl.style.backgroundColor = '#f44336';
    messageEl.style.color = 'white';
  } else if (type === 'success') {
    messageEl.style.backgroundColor = '#4CAF50';
    messageEl.style.color = 'white';
  } else {
    messageEl.style.backgroundColor = '#2196F3';
    messageEl.style.color = 'white';
  }
  
  messageEl.textContent = message;
  
  // Add close button
  const closeBtn = document.createElement('button');
  closeBtn.textContent = 'Dismiss';
  closeBtn.style.cssText = 'margin-left:10px;padding:2px 5px;background:white;border:none;border-radius:2px;cursor:pointer;';
  closeBtn.onclick = function() {
    messageEl.remove();
  };
  
  messageEl.appendChild(closeBtn);
  diagnosticContainer.appendChild(messageEl);
}

// Create test interface
function createTestInterface() {
  const interfaceContainer = document.createElement('div');
  interfaceContainer.style.cssText = 'position:fixed;top:10px;right:10px;z-index:10000;background:white;padding:10px;border-radius:4px;box-shadow:0 2px 10px rgba(0,0,0,0.2);';
  
  const title = document.createElement('h3');
  title.textContent = 'Firebase Test Tools';
  title.style.margin = '0 0 10px 0';
  
  const btnFirestore = document.createElement('button');
  btnFirestore.textContent = 'Test Firestore Write';
  btnFirestore.style.cssText = 'display:block;margin-bottom:5px;padding:5px 10px;background:#2196F3;color:white;border:none;border-radius:4px;cursor:pointer;';
  btnFirestore.onclick = testFirestoreWrite;
  
  const btnDataService = document.createElement('button');
  btnDataService.textContent = 'Test DataService';
  btnDataService.style.cssText = 'display:block;margin-bottom:5px;padding:5px 10px;background:#4CAF50;color:white;border:none;border-radius:4px;cursor:pointer;';
  btnDataService.onclick = testDataService;
  
  const closeBtn = document.createElement('button');
  closeBtn.textContent = 'Close';
  closeBtn.style.cssText = 'display:block;padding:5px 10px;background:#f44336;color:white;border:none;border-radius:4px;cursor:pointer;';
  closeBtn.onclick = function() {
    interfaceContainer.remove();
  };
  
  interfaceContainer.appendChild(title);
  interfaceContainer.appendChild(btnFirestore);
  interfaceContainer.appendChild(btnDataService);
  interfaceContainer.appendChild(closeBtn);
  
  document.body.appendChild(interfaceContainer);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('Firebase test script initialized');
  
  // Add a small delay to ensure Firebase is initialized
  setTimeout(function() {
    createTestInterface();
    
    // Check Firebase initialization
    if (window.firebaseServices && window.firebaseServices.isInitialized) {
      showDiagnosticMessage('Firebase appears to be initialized properly', 'success');
    } else {
      showDiagnosticMessage('Firebase does not appear to be initialized properly', 'error');
    }
  }, 2000);
}); 