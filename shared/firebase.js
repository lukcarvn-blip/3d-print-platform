// ============================================================
// Legato — Firebase Firestore Sync Layer
// Dùng project "lukcar" từ Legato
// ============================================================

const firebaseConfig = {
  apiKey: "AIzaSyDci6CTwvTMkHke11vzlnNdZzlgt2XyDe0",
  authDomain: "penchydrop.firebaseapp.com",
  projectId: "penchydrop",
  storageBucket: "penchydrop.firebasestorage.app",
  messagingSenderId: "434052634802",
  appId: "1:434052634802:web:31b7cbbae612854fa691ab",
  measurementId: "G-EEJPRWT9BZ"
};

// Initialize Firebase (guard against double-init)
if (typeof firebase !== 'undefined' && !firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const BDB = {
  // Firestore collection name
  COLLECTION: 'Legato_drops',
  NEWS_COLLECTION: 'Legato_news',
  
  db: null,
  
  init() {
    if (typeof firebase === 'undefined') {
      console.warn('[BDB] Firebase SDK not loaded yet.');
      return;
    }
    this.db = firebase.firestore();
    console.log('[BDB] Firestore connected to project: lukcar');
  },

  // ── DROPS ──────────────────────────────────────────────

  async getDrops() {
    if (!this.db) throw new Error("Database not initialized");
    const snap = await this.db.collection(this.COLLECTION).orderBy('createdAt', 'desc').get();
    let drops = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Auto-seed if empty
    if (drops.length === 0 && typeof DB !== 'undefined') {
      console.log('[BDB] Cloud is empty! Auto-migrating local data...');
      await this.migrateLocalToFirestore();
      const snap2 = await this.db.collection(this.COLLECTION).orderBy('createdAt', 'desc').get();
      drops = snap2.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    return drops;
  },

  listenDrops(callback) {
    if (!this.db) return null;
    return this.db.collection(this.COLLECTION)
      .orderBy('createdAt', 'desc')
      .onSnapshot({ includeMetadataChanges: false }, snap => {
        if (snap.metadata.fromCache) return;
        let drops = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(drops);
      }, err => {
        console.warn('[BDB] Realtime listener error:', err.message);
      });
  },

  async addDrop(drop) {
    if (!this.db) throw new Error("Database not initialized");
    await this.db.collection(this.COLLECTION).doc(drop.id).set({
      ...drop,
      createdAt: drop.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    console.log('[BDB] Drop added to Firestore:', drop.id);
    return drop;
  },

  async updateDrop(dropId, data) {
    if (!this.db) throw new Error("Database not initialized");
    await this.db.collection(this.COLLECTION).doc(dropId).update({
      ...data,
      updatedAt: new Date().toISOString()
    });
    console.log('[BDB] Drop updated on Firestore:', dropId);
  },

  async deleteDrop(dropId) {
    if (!this.db) throw new Error("Database not initialized");
    await this.db.collection(this.COLLECTION).doc(dropId).delete();
    console.log('[BDB] Drop deleted from Firestore:', dropId);
  },

  async migrateLocalToFirestore() {
    if (!this.db || typeof DB === 'undefined') return;
    const localDrops = DB.getDrops();
    if (!localDrops || !localDrops.length) return;
    
    const batch = this.db.batch();
    localDrops.forEach(drop => {
      const ref = this.db.collection(this.COLLECTION).doc(drop.id);
      batch.set(ref, {
        ...drop,
        createdAt: drop.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        migratedFrom: 'localStorage'
      }, { merge: true });
    });
    
    await batch.commit();
    console.log(`[BDB] Migrated ${localDrops.length} drops to Firestore!`);
  },

  // ── NEWS ──────────────────────────────────────────────

  async getNews() {
    if (!this.db) throw new Error("Database not initialized");
    const snap = await this.db.collection(this.NEWS_COLLECTION).orderBy('createdAt', 'desc').get();
    let newsList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    if (newsList.length === 0 && typeof DB !== 'undefined') {
      await this.migrateLocalNewsToFirestore();
      const snap2 = await this.db.collection(this.NEWS_COLLECTION).orderBy('createdAt', 'desc').get();
      newsList = snap2.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    return newsList;
  },

  listenNews(callback) {
    if (!this.db) return;
    this.db.collection(this.NEWS_COLLECTION)
      .orderBy('createdAt', 'desc')
      .onSnapshot({ includeMetadataChanges: false }, snap => {
        if (snap.metadata.fromCache) return;
        let newsList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(newsList);
      }, err => {
        console.warn('[BDB] Realtime news listener error:', err.message);
      });
  },

  async addNews(article) {
    if (!this.db) throw new Error("Database not initialized");
    await this.db.collection(this.NEWS_COLLECTION).doc(article.id).set({
      ...article,
      createdAt: article.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return article;
  },

  async updateNews(id, data) {
    if (!this.db) throw new Error("Database not initialized");
    await this.db.collection(this.NEWS_COLLECTION).doc(id).update({
      ...data,
      updatedAt: new Date().toISOString()
    });
  },

  async deleteNews(id) {
    if (!this.db) throw new Error("Database not initialized");
    await this.db.collection(this.NEWS_COLLECTION).doc(id).delete();
  },

  async migrateLocalNewsToFirestore() {
    if (!this.db || typeof DB === 'undefined') return;
    const localNews = DB.getNews();
    if (!localNews || !localNews.length) return;
    
    const batch = this.db.batch();
    localNews.forEach(article => {
      const ref = this.db.collection(this.NEWS_COLLECTION).doc(article.id);
      batch.set(ref, {
        ...article,
        createdAt: article.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        migratedFrom: 'localStorage'
      }, { merge: true });
    });
    
    await batch.commit();
    console.log(`[BDB] Migrated ${localNews.length} news articles to Firestore!`);
  }
};
