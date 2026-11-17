/**
 * THE MODEST EDIT — Firebase Cloud Integration Engine
 * Project ID: the-modest-edit
 * Database: Cloud Firestore + Realtime Database
 */

const firebaseConfig = {
  apiKey: "AIzaSyAWB-ycaEvD-SNO4v-qhEL6gwV92VjupSI",
  authDomain: "the-modest-edit.firebaseapp.com",
  databaseURL: "https://the-modest-edit-default-rtdb.firebaseio.com",
  projectId: "the-modest-edit",
  storageBucket: "the-modest-edit.firebasestorage.app",
  messagingSenderId: "599569143211",
  appId: "1:599569143211:web:0cf15521c49f6e62152eee",
  measurementId: "G-71WCTR41F9"
};

// Global Firebase handles
let fbApp = null;
let fbDb = null;
let fbRtdb = null;

try {
  if (typeof firebase !== 'undefined') {
    if (!firebase.apps.length) {
      fbApp = firebase.initializeApp(firebaseConfig);
    } else {
      fbApp = firebase.app();
    }
    
    // Firestore
    try {
      fbDb = firebase.firestore();
      console.log('✅ Firebase Cloud Firestore initialized successfully.');
    } catch (e) {
      console.warn('Firestore initialization notice:', e);
    }

    // Realtime Database (Fallback / Realtime sync)
    try {
      if (typeof firebase.database === 'function') {
        fbRtdb = firebase.database();
        console.log('✅ Firebase Realtime Database initialized successfully.');
      }
    } catch (e) {
      console.warn('Realtime Database notice:', e);
    }
  } else {
    console.warn('Firebase SDK scripts not loaded on this page.');
  }
} catch (err) {
  console.error('Firebase initialization error:', err);
}

/**
 * Saves a customer checkout order to Firebase
 * @param {Object} orderData
 * @returns {Promise<string>} Order ID or document reference
 */
async function saveOrderToFirebase(orderData) {
  const enhancedOrder = {
    ...orderData,
    status: orderData.status || 'Pending',
    createdAt: new Date().toISOString(),
    timestamp: Date.now()
  };

  let savedId = orderData.orderId;

  // 1. Save to Cloud Firestore
  if (fbDb) {
    try {
      await fbDb.collection('orders').doc(orderData.orderId).set(enhancedOrder);
      console.log('📦 Order saved to Firestore:', orderData.orderId);
      savedId = orderData.orderId;
    } catch (fsErr) {
      console.warn('Firestore save failed, trying Realtime Database fallback:', fsErr);
    }
  }

  // 2. Save to Realtime Database as backup / sync
  if (fbRtdb) {
    try {
      await fbRtdb.ref('orders/' + orderData.orderId).set(enhancedOrder);
      console.log('📦 Order synced to Realtime Database:', orderData.orderId);
      savedId = orderData.orderId;
    } catch (rtErr) {
      console.warn('Realtime Database save error:', rtErr);
    }
  }

  // 3. Local fallback copy in localStorage so admin always works even offline
  try {
    const existingOrders = JSON.parse(localStorage.getItem('tme_saved_orders') || '[]');
    existingOrders.unshift(enhancedOrder);
    localStorage.setItem('tme_saved_orders', JSON.stringify(existingOrders));
  } catch (lsErr) {}

  return savedId;
}

/**
 * Real-time listener for Orders (Used by Admin Dashboard)
 * @param {Function} callback (ordersArray) => void
 */
function listenToOrders(callback) {
  // If Firestore is available, use onSnapshot for live real-time updates
  if (fbDb) {
    try {
      return fbDb.collection('orders').orderBy('timestamp', 'desc').onSnapshot((snapshot) => {
        const orders = [];
        snapshot.forEach(doc => {
          orders.push({ id: doc.id, ...doc.data() });
        });
        callback(orders);
      }, (err) => {
        console.warn('Firestore snapshot error, falling back to RTDB/local:', err);
        fallbackListenOrders(callback);
      });
    } catch (e) {
      console.warn('Firestore listen setup error:', e);
      fallbackListenOrders(callback);
    }
  } else {
    fallbackListenOrders(callback);
  }
}

function fallbackListenOrders(callback) {
  if (fbRtdb) {
    try {
      fbRtdb.ref('orders').on('value', (snapshot) => {
        const val = snapshot.val();
        if (val) {
          const list = Object.keys(val).map(k => ({ id: k, ...val[k] }));
          list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
          callback(list);
        } else {
          callback(getLocalOrders());
        }
      });
      return;
    } catch (e) {}
  }
  // Offline fallback
  callback(getLocalOrders());
}

function getLocalOrders() {
  try {
    return JSON.parse(localStorage.getItem('tme_saved_orders') || '[]');
  } catch (e) {
    return [];
  }
}

/**
 * Updates an order status (e.g. 'Pending' -> 'Confirmed' -> 'Dispatched' -> 'Delivered')
 */
async function updateOrderStatus(orderId, newStatus) {
  // Firestore
  if (fbDb) {
    try {
      await fbDb.collection('orders').doc(orderId).update({ status: newStatus });
    } catch (e) {
      console.warn('Firestore update status error:', e);
    }
  }

  // RTDB
  if (fbRtdb) {
    try {
      await fbRtdb.ref('orders/' + orderId).update({ status: newStatus });
    } catch (e) {}
  }

  // Local storage
  try {
    const list = getLocalOrders();
    const target = list.find(o => o.orderId === orderId);
    if (target) {
      target.status = newStatus;
      localStorage.setItem('tme_saved_orders', JSON.stringify(list));
    }
  } catch (e) {}
}

/**
 * Saves a contact message to Firebase
 */
async function saveContactMessage(msgData) {
  const item = {
    ...msgData,
    date: new Date().toISOString(),
    timestamp: Date.now()
  };

  if (fbDb) {
    try {
      await fbDb.collection('messages').add(item);
    } catch (e) {}
  }
  if (fbRtdb) {
    try {
      await fbRtdb.ref('messages').push(item);
    } catch (e) {}
  }
}
