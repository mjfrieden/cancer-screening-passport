import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  indexedDBLocalPersistence,
  initializeAuth,
  reauthenticateWithCredential,
  signInWithCredential,
  signInWithPopup,
  User,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || undefined,
};

const firestoreDatabaseId = import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || undefined;
const missingFirebaseKeys = Object.entries(firebaseConfig)
  .filter(([key, value]) => key !== 'measurementId' && !value)
  .map(([key]) => key);

if (missingFirebaseKeys.length > 0) {
  throw new Error(`Missing Firebase environment variables: ${missingFirebaseKeys.join(', ')}`);
}

const app = initializeApp(firebaseConfig);
export const db = firestoreDatabaseId ? getFirestore(app, firestoreDatabaseId) : getFirestore(app);
export const auth = Capacitor.isNativePlatform()
  ? initializeAuth(app, { persistence: indexedDBLocalPersistence })
  : getAuth(app);
export const googleProvider = new GoogleAuthProvider();

async function getNativeGoogleCredential() {
  const result = await FirebaseAuthentication.signInWithGoogle({
    skipNativeAuth: true,
  });
  const idToken = result.credential?.idToken;

  if (!idToken) {
    throw new Error('Google did not return a valid sign-in credential.');
  }

  return GoogleAuthProvider.credential(idToken);
}

export const signInWithGoogle = async () => {
  if (!Capacitor.isNativePlatform()) {
    return signInWithPopup(auth, googleProvider);
  }

  return signInWithCredential(auth, await getNativeGoogleCredential());
};

export const reauthenticateWithGoogle = async (user: User) => {
  if (!Capacitor.isNativePlatform()) {
    const { reauthenticateWithPopup } = await import('firebase/auth');
    return reauthenticateWithPopup(user, googleProvider);
  }

  return reauthenticateWithCredential(user, await getNativeGoogleCredential());
};

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export class FirestoreOperationError extends Error {
  readonly code = 'firestore-operation-failed';

  constructor(readonly operationType: OperationType) {
    super('We could not save or load your information. Please try again.');
    this.name = 'FirestoreOperationError';
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, _path: string | null): never {
  if (import.meta.env.DEV) {
    const firebaseCode = (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      typeof error.code === 'string'
    ) ? error.code : 'unknown';
    console.error('Firestore operation failed.', { operationType, firebaseCode });
  }

  throw new FirestoreOperationError(operationType);
}
