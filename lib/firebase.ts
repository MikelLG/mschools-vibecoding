import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import type { Submission } from './types';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);

export async function saveSubmission(submission: Omit<Submission, 'id'> & { id: string }) {
  const ref = doc(db, 'submissions', submission.id);
  await setDoc(ref, { ...submission, createdAt: Timestamp.fromMillis(submission.createdAt) });
}

export async function getSubmission(id: string): Promise<Submission | null> {
  const ref = doc(db, 'submissions', id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = snap.data();
  return { ...data, id: snap.id, createdAt: (data.createdAt as Timestamp).toMillis() } as Submission;
}

export async function getSubmissions(sessionId: string): Promise<Submission[]> {
  const q = query(collection(db, 'submissions'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs
    .map(d => {
      const data = d.data();
      return { ...data, id: d.id, createdAt: (data.createdAt as Timestamp).toMillis() } as Submission;
    })
    .filter(s => s.sessionId === sessionId);
}

export function subscribeSubmissions(sessionId: string, cb: (submissions: Submission[]) => void) {
  const q = query(collection(db, 'submissions'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, snap => {
    const results = snap.docs
      .map(d => {
        const data = d.data();
        return { ...data, id: d.id, createdAt: (data.createdAt as Timestamp).toMillis() } as Submission;
      })
      .filter(s => s.sessionId === sessionId);
    cb(results);
  });
}
