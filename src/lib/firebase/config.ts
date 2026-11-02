/**
 * Firebase web configuration. These values are public by design (they ship in
 * the browser bundle): access is enforced by Firestore security rules
 * (firestore.rules), not by secrecy. They are kept here as defaults so a build
 * never depends on dashboard variables; NEXT_PUBLIC_FIREBASE_* can override
 * them, e.g. to point a test build at another project.
 */
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDT1zJ9FhMl9QEw5EhAqhRLBgoY01TlsTM",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "smarteyecivilengineering-578e2.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "smarteyecivilengineering-578e2",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "smarteyecivilengineering-578e2.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "788088611967",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:788088611967:web:2ba3aae3d5bd32efdd4b4a",
};

/** Mailbox that becomes the first administrator (see firestore.rules). */
export const BOOTSTRAP_ADMIN_EMAIL = "smarteyecivilengineering@gmail.com";
