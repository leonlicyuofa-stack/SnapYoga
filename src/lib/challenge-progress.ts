// Per-user challenge start-date tracking — shared by the challenges list and challenge detail pages.

import { firestore } from '@/lib/firebase/clientApp';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { format, differenceInCalendarDays } from 'date-fns';

/** Returns the user's start date (yyyy-MM-dd) for a challenge, recording today's date the first time it's viewed. */
export async function ensureChallengeStarted(uid: string, challengeId: string): Promise<string> {
  const ref = doc(firestore, 'users', uid, 'challengeProgress', challengeId);
  const snap = await getDoc(ref);
  if (snap.exists() && snap.data().startDate) {
    return snap.data().startDate as string;
  }
  const startDate = format(new Date(), 'yyyy-MM-dd');
  await setDoc(ref, { startDate, startedAt: serverTimestamp() }, { merge: true });
  return startDate;
}

/** 1-based day number the user is currently on, clamped to totalDays. */
export function computeChallengeDay(startDate: string, totalDays: number): number {
  const start = new Date(`${startDate}T00:00:00`);
  const daysSince = differenceInCalendarDays(new Date(), start);
  return Math.min(Math.max(daysSince + 1, 1), totalDays);
}
