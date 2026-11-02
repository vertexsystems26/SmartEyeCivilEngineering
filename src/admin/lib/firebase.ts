"use client";

import { getApp, getApps, initializeApp } from "firebase/app";
import { browserLocalPersistence, getAuth, setPersistence } from "firebase/auth";
import { getFirestore, initializeFirestore, type Firestore } from "firebase/firestore/lite";
import { firebaseConfig } from "@/lib/firebase/config";

/*
 * Firebase client for the back-office only (never imported by public pages).
 * Firestore "lite" is enough: no realtime listeners or offline cache needed,
 * and it is a fraction of the full SDK's size.
 */
const isNew = getApps().length === 0;
export const app = isNew ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
auth.languageCode = "fr";
void setPersistence(auth, browserLocalPersistence);

// Optional form fields may be undefined: drop them instead of failing the write.
export const db: Firestore = isNew ? initializeFirestore(app, { ignoreUndefinedProperties: true }) : getFirestore(app);
