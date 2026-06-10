import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import type { Submission, WorkshopTimer, PrintQueueItem } from './types';

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

export async function updateSubmission(id: string, updates: Partial<Submission>) {
  const ref = doc(db, 'submissions', id);
  await setDoc(ref, updates, { merge: true });
}

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

// ── Workshop timer ─────────────────────────────────────────────────────────────

const TIMER_DOC = 'timer';
const WORKSHOP_COLLECTION = 'workshop';

export const DEFAULT_TIMER: WorkshopTimer = {
  phase: 0,
  phaseLabel: '',
  instruction: '',
  color: '#ea580c',
  bg: '#fff7ed',
  durationSeconds: 300,
  startedAt: 0,
  secondsAtStart: 300,
  running: false,
};

export async function updateWorkshopTimer(updates: Partial<WorkshopTimer>) {
  const ref = doc(db, WORKSHOP_COLLECTION, TIMER_DOC);
  await setDoc(ref, updates, { merge: true });
}

export function subscribeWorkshopTimer(cb: (timer: WorkshopTimer) => void) {
  const ref = doc(db, WORKSHOP_COLLECTION, TIMER_DOC);
  return onSnapshot(ref, snap => {
    if (!snap.exists()) { cb(DEFAULT_TIMER); return; }
    cb({ ...DEFAULT_TIMER, ...snap.data() } as WorkshopTimer);
  });
}

// ── Submissions ────────────────────────────────────────────────────────────────

// ── Print queue ────────────────────────────────────────────────────────────────

export async function addToPrintQueue(item: Omit<PrintQueueItem, 'id'>): Promise<string> {
  const ref = doc(collection(db, 'printQueue'));
  await setDoc(ref, { ...item, createdAt: Timestamp.fromMillis(item.createdAt) });
  return ref.id;
}

export async function updatePrintQueueItem(id: string, updates: Partial<Omit<PrintQueueItem, 'id'>>) {
  const ref = doc(db, 'printQueue', id);
  await setDoc(ref, updates, { merge: true });
}

export async function getPrintQueueItem(id: string): Promise<PrintQueueItem | null> {
  const ref = doc(db, 'printQueue', id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = snap.data();
  return { ...data, id: snap.id, createdAt: (data.createdAt as Timestamp).toMillis() } as PrintQueueItem;
}

export function subscribePrintQueue(sessionId: string, cb: (items: PrintQueueItem[]) => void) {
  const q = query(collection(db, 'printQueue'), orderBy('createdAt', 'asc'));
  return onSnapshot(q, snap => {
    const items = snap.docs
      .map(d => {
        const data = d.data();
        return { ...data, id: d.id, createdAt: (data.createdAt as Timestamp).toMillis() } as PrintQueueItem;
      })
      .filter(item => item.sessionId === sessionId);
    cb(items);
  });
}

export function subscribeSubmissions(sessionId: string, cb: (submissions: Submission[]) => void, allSessions = false) {
  const q = query(collection(db, 'submissions'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, snap => {
    const results = snap.docs
      .map(d => {
        const data = d.data();
        return { ...data, id: d.id, createdAt: (data.createdAt as Timestamp).toMillis() } as Submission;
      })
      .filter(s => allSessions || s.sessionId === sessionId);
    cb(results);
  });
}
