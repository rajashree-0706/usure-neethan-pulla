import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  collection, 
  onSnapshot, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  runTransaction, 
  arrayUnion, 
  query, 
  where, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged, type User } from 'firebase/auth';

export const getFirebaseConfig = () => ({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
});

export const isFirebaseConfigured = (): boolean => {
  const config = getFirebaseConfig();
  if (!config.apiKey || !config.projectId || config.apiKey.trim() === "" || config.projectId.trim() === "" || config.apiKey.includes("DemoConfigKey") || config.projectId === "hangman-arena-demo") {
    return false;
  }
  return true;
};

let app: any = null;
let dbInstance: any = null;
let authInstance: any = null;

export const getFirebaseApp = () => {
  if (!isFirebaseConfigured()) return null;
  if (!app) {
    const config = getFirebaseConfig();
    try {
      app = !getApps().length ? initializeApp(config) : getApp();
      dbInstance = getFirestore(app);
      authInstance = getAuth(app);
      console.log("[CREATE] Firebase initialized successfully with project:", config.projectId);
    } catch (e) {
      console.error("[CREATE] Firebase initialization error:", e);
    }
  }
  return { app, db: dbInstance, auth: authInstance };
};

// Initialize once
getFirebaseApp();

export const db = dbInstance;
export const auth = authInstance;

export const ensureAuth = (): Promise<User> => {
  return new Promise((resolve) => {
    const activeAuth = authInstance || (getFirebaseApp()?.auth);

    if (!isFirebaseConfigured() || !activeAuth) {
      console.warn("[CREATE] Firebase Auth missing, using client identity fallback");
      const fallbackUser = { uid: 'usr_' + Math.random().toString(36).substring(2, 9) } as User;
      resolve(fallbackUser);
      return;
    }

    if (activeAuth.currentUser) {
      console.log("[CREATE] Host authenticated (existing session):", activeAuth.currentUser.uid);
      resolve(activeAuth.currentUser);
      return;
    }

    const authTimeout = setTimeout(() => {
      console.warn("[CREATE] Auth timed out, using fallback client identity");
      const fallbackUser = { uid: 'usr_' + Math.random().toString(36).substring(2, 9) } as User;
      resolve(fallbackUser);
    }, 4000);

    const unsubscribe = onAuthStateChanged(activeAuth, (user) => {
      if (user) {
        clearTimeout(authTimeout);
        unsubscribe();
        console.log("[CREATE] Host authenticated (auth state changed):", user.uid);
        resolve(user);
      } else {
        signInAnonymously(activeAuth)
          .then((cred) => {
            clearTimeout(authTimeout);
            unsubscribe();
            console.log("[CREATE] Host authenticated (anonymous sign-in):", cred.user.uid);
            resolve(cred.user);
          })
          .catch((err) => {
            clearTimeout(authTimeout);
            unsubscribe();
            console.warn("[CREATE] Anonymous sign-in warning:", err.message, "- using client identity fallback");
            const fallbackUser = { uid: 'usr_' + Math.random().toString(36).substring(2, 9) } as User;
            resolve(fallbackUser);
          });
      }
    }, (err) => {
      clearTimeout(authTimeout);
      unsubscribe();
      console.warn("[CREATE] Auth state listener warning:", err, "- using client identity fallback");
      const fallbackUser = { uid: 'usr_' + Math.random().toString(36).substring(2, 9) } as User;
      resolve(fallbackUser);
    });
  });
};

export { 
  doc, 
  collection, 
  onSnapshot, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  runTransaction, 
  arrayUnion, 
  query, 
  where, 
  serverTimestamp,
  Timestamp 
};
