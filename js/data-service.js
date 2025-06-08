// Firestore CRUD Operations
const dataService = {
  // Create
  async createDoc(collection, data) {
    console.log('dataService.createDoc called with:', { collection, data });
    
    try {
      if (!firebaseServices || !firebaseServices.db) {
        throw new Error('Firebase services not initialized');
      }
      
      // Make sure to use server timestamp
      const timestamp = firebase.firestore.FieldValue.serverTimestamp();
      const docData = {
        ...data,
        createdAt_server: timestamp
      };
      
      // Add the document with add() method
      const docRef = await firebaseServices.db
        .collection(collection)
        .add(docData);
      
      console.log(`Document created in ${collection} with ID:`, docRef.id);
      return docRef.id;
    } catch (error) {
      console.error(`Error creating ${collection} doc:`, error);
      throw error;
    }
  },
  
  // Read
  async getDoc(collection, id) {
    try {
      if (!firebaseServices || !firebaseServices.db) {
        throw new Error('Firebase services not initialized');
      }
      
      const doc = await firebaseServices.db
        .collection(collection)
        .doc(id)
        .get();
      
      if (!doc.exists) {
        console.log(`Document not found in ${collection} with ID: ${id}`);
        return null;
      }
      
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      console.error(`Error reading ${collection} doc:`, error);
      throw error;
    }
  },
  
  // Update
  async updateDoc(collection, id, data) {
    try {
      if (!firebaseServices || !firebaseServices.db) {
        throw new Error('Firebase services not initialized');
      }
      
      // Add updated timestamp
      const updateData = {
        ...data,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      };
      
      await firebaseServices.db
        .collection(collection)
        .doc(id)
        .update(updateData);
      
      console.log(`Document updated in ${collection} with ID: ${id}`);
    } catch (error) {
      console.error(`Error updating ${collection} doc:`, error);
      throw error;
    }
  },
  
  // Delete
  async deleteDoc(collection, id) {
    try {
      if (!firebaseServices || !firebaseServices.db) {
        throw new Error('Firebase services not initialized');
      }
      
      await firebaseServices.db
        .collection(collection)
        .doc(id)
        .delete();
      
      console.log(`Document deleted from ${collection} with ID: ${id}`);
    } catch (error) {
      console.error(`Error deleting ${collection} doc:`, error);
      throw error;
    }
  }
};

window.dataService = dataService;
