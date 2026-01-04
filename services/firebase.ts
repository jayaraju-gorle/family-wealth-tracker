import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, Database } from 'firebase/database';
import { getAuth, signInAnonymously, Auth } from 'firebase/auth';
import { AppState } from '../types';

// ============================================================================
// DEVELOPER SETUP:
// 1. Go to Firebase Console -> Project Settings -> General -> Your Apps
// 2. Copy your config object and replace the values below.
// 3. Ensure Authentication -> Sign-in method -> Anonymous is ENABLED
// 4. Ensure Realtime Database is CREATED and Rules are published
// ============================================================================
const firebaseConfig = {
  apiKey: "AIzaSyDybUoQaAaE1EeBFyeEDAhaj1dGYPV2HLI",
  authDomain: "gen-lang-client-0981591737.firebaseapp.com",
  projectId: "gen-lang-client-0981591737",
  storageBucket: "gen-lang-client-0981591737.firebasestorage.app",
  messagingSenderId: "772545827002",
  appId: "1:772545827002:web:613a4136efcf73cf45b283",
  measurementId: "G-NKLTWW0Q55",
  // IMPORTANT: Database URL is required for Realtime Database
  databaseURL: "https://gen-lang-client-0981591737-default-rtdb.asia-southeast1.firebasedatabase.app"
};

let app: FirebaseApp | undefined;
let db: Database | undefined;
let auth: Auth | undefined;
let mockMode = false;

export const isFirebaseInitialized = () => !!app || mockMode;
export const isMock = () => mockMode;

export const initFirebase = () => {
  try {
    // Prevent double init
    if (getApps().length) {
      app = getApps()[0];
      db = getDatabase(app);
      auth = getAuth(app);
      return true;
    }

    // Check if config is actually set by the developer
    if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "AIzaSy..." || !firebaseConfig.apiKey.startsWith("AIza")) {
      console.warn("Firebase Config is missing or invalid. Enabled DEMO MODE (Local Simulation).");
      mockMode = true;
      return true;
    }

    app = initializeApp(firebaseConfig);
    db = getDatabase(app);
    auth = getAuth(app);
    return true;
  } catch (e) {
    console.error("Firebase init failed", e);
    // Fallback to mock mode on error to prevent app crash
    mockMode = true;
    return true;
  }
};

export const syncFamilyData = async (familyId: string, data: AppState) => {
  if (mockMode) {
    console.log(`[Demo Mode] Syncing to family ${familyId}:`, data);
    return;
  }
  if (!db || !familyId) return;
  try {
    const familyRef = ref(db, `families/${familyId}`);
    await set(familyRef, data);
  } catch (e) {
    console.error("Error syncing data:", e);
    throw e;
  }
};

export const subscribeToFamilyData = (familyId: string, callback: (data: AppState) => void) => {
  if (mockMode) {
    console.log(`[Demo Mode] Subscribed to family ${familyId}`);
    return () => { };
  }
  if (!db || !familyId) return () => { };

  const familyRef = ref(db, `families/${familyId}`);
  const unsubscribe = onValue(familyRef, (snapshot) => {
    const val = snapshot.val();
    if (val) {
      callback(val);
    }
  }, (error) => {
    console.error("Firebase Subscription Error:", error);
  });

  return unsubscribe;
};

export const authenticateAnonymously = async () => {
  if (mockMode) {
    await new Promise(resolve => setTimeout(resolve, 800));
    return;
  }

  if (!auth) {
    const success = initFirebase();
    if (!success) throw new Error("Firebase configuration missing");
  }

  if (mockMode) return;

  if (!auth) throw new Error("Firebase Auth failed to initialize.");

  try {
    await signInAnonymously(auth);
  } catch (error: any) {
    console.error("Auth Error:", error);
    if (error.code === 'auth/admin-restricted-operation' || error.code === 'auth/operation-not-allowed') {
      console.error("IMPORTANT: Enable 'Anonymous' sign-in in Firebase Console -> Authentication.");
    }
    throw error;
  }
};