// Firestore CRUD Operations
const dataService = {
  // Create
  async createDoc(collection, data) {
    try {
      const docRef = await firebaseServices.db
        .collection(collection)
        .add({
          ...data,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      return docRef.id;
    } catch (error) {
      console.error(`Error creating ${collection} doc:`, error);
      throw error;
    }
  },
  
  // Read
  async getDoc(collection, id) {
    try {
      const doc = await firebaseServices.db
        .collection(collection)
        .doc(id)
        .get();
      return doc.exists ? { id: doc.id, ...doc.data() } : null;
    } catch (error) {
      console.error(`Error reading ${collection} doc:`, error);
      throw error;
    }
  },
  
  // Update
  async updateDoc(collection, id, data) {
    try {
      await firebaseServices.db
        .collection(collection)
        .doc(id)
        .update(data);
    } catch (error) {
      console.error(`Error updating ${collection} doc:`, error);
      throw error;
    }
  },
  
  // Delete
  async deleteDoc(collection, id) {
    try {
      await firebaseServices.db
        .collection(collection)
        .doc(id)
        .delete();
    } catch (error) {
      console.error(`Error deleting ${collection} doc:`, error);
      throw error;
    }
  }
};

window.dataService = dataService;
