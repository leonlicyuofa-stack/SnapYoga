import { firestore } from '@/lib/firebase/clientApp';
import { collection, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { format, subDays } from 'date-fns';
import type { User } from 'firebase/auth';

export const dayKey = (d: Date) => format(d, 'yyyy-MM-dd');

export interface StoredStreak {
  /** Consecutive days practised, as of lastPracticeDate. */
  streak: number;
  /** The best run the account has ever had. */
  longestStreak: number;
  /** yyyy-MM-dd of the most recent practice. */
  lastPracticeDate: string | null;
}

/**
 * A streak is only "live" if it was extended today or yesterday — miss a whole
 * day and it's back to nothing, which is the whole point of a streak.
 */
export function currentStreak(stored: Partial<StoredStreak> | undefined | null, today = new Date()): number {
  if (!stored?.lastPracticeDate || !stored.streak) return 0;
  const last = stored.lastPracticeDate;
  if (last === dayKey(today) || last === dayKey(subDays(today, 1))) return stored.streak;
  return 0;
}

/** True when today hasn't been logged yet, so the streak is still at risk. */
export function todayStillOpen(stored: Partial<StoredStreak> | undefined | null, today = new Date()): boolean {
  return stored?.lastPracticeDate !== dayKey(today);
}

/**
 * Count the run of consecutive days ending today (or yesterday) in a set of
 * practised day keys. Used to seed the stored streak for accounts that were
 * practising before the streak was ever recorded.
 */
export function streakFromDays(days: Set<string>, today = new Date()): number {
  let cursor = new Date(today);
  // A streak survives today not being logged yet; it breaks on a missed yesterday.
  if (!days.has(dayKey(cursor))) {
    cursor = subDays(cursor, 1);
    if (!days.has(dayKey(cursor))) return 0;
  }
  let n = 0;
  while (days.has(dayKey(cursor))) {
    n += 1;
    cursor = subDays(cursor, 1);
  }
  return n;
}

/**
 * Every day the user has practised between two dates. A day counts if it has a
 * pose analysis, a logged activity, or a completed challenge task — any one of
 * them is a practice.
 */
export async function loadPracticeDays(uid: string, start: Date, end: Date): Promise<Set<string>> {
  const startKey = dayKey(start);
  const endKey = dayKey(end);
  const days = new Set<string>();

  const [activity, analyses, tasks] = await Promise.all([
    getDocs(query(collection(firestore, `users/${uid}/activity`), where('__name__', '>=', startKey), where('__name__', '<=', endKey))),
    getDocs(query(collection(firestore, `users/${uid}/poseAnalyses`), where('createdAt', '>=', start), where('createdAt', '<=', end))),
    getDocs(query(collection(firestore, `users/${uid}/challengeTasks`), where('__name__', '>=', startKey), where('__name__', '<=', endKey))),
  ]);

  activity.forEach(d => days.add(d.id));
  analyses.forEach(d => {
    const created = (d.data() as any).createdAt;
    if (created?.toDate) days.add(dayKey(created.toDate()));
  });
  tasks.forEach(d => days.add(d.id.split('_')[0]));

  return days;
}

/** Read the stored streak fields off the user document. */
export async function readStreak(uid: string): Promise<StoredStreak> {
  const snap = await getDoc(doc(firestore, 'users', uid));
  const data = snap.exists() ? snap.data() : {};
  return {
    streak: typeof data.streak === 'number' ? data.streak : 0,
    longestStreak: typeof data.longestStreak === 'number' ? data.longestStreak : 0,
    lastPracticeDate: typeof data.lastPracticeDate === 'string' ? data.lastPracticeDate : null,
  };
}

/**
 * Record that the user practised today: stamp the day and move the streak on.
 * Safe to call more than once a day — the second call is a no-op.
 *
 * Returns the streak after recording, so a caller can celebrate it.
 */
export async function recordPractice(user: User, today = new Date()): Promise<number> {
  const todayKey = dayKey(today);
  const yesterdayKey = dayKey(subDays(today, 1));

  // The day stamp is what the charts read; keep it even if the streak write fails.
  await setDoc(doc(firestore, 'users', user.uid, 'activity', todayKey), { practisedAt: today.toISOString() }, { merge: true });

  const stored = await readStreak(user.uid);
  if (stored.lastPracticeDate === todayKey) return stored.streak;

  const next = stored.lastPracticeDate === yesterdayKey ? stored.streak + 1 : 1;
  await setDoc(
    doc(firestore, 'users', user.uid),
    { streak: next, longestStreak: Math.max(next, stored.longestStreak), lastPracticeDate: todayKey },
    { merge: true },
  );
  return next;
}
