// Shared challenge catalog — single source for the Challenges page and search.

export type Category = 'Balancing' | 'Strength' | 'Mobility' | 'Flexibility';

export const CATEGORIES: Category[] = ['Balancing', 'Strength', 'Mobility', 'Flexibility'];

export interface PoseChallenge {
  id: string; name: string; category: Category; emoji: string; grad: string;
  difficulty: number; status: 'active' | 'upcoming' | 'completed';
  totalDays?: number; detailLink: string;
}

export const poseChallenges: PoseChallenge[] = [
  { id: 'headstand',  name: 'Headstand',    category: 'Balancing',   emoji: '🧘', grad: 'linear-gradient(160deg,#3a4a63,#1a2233)', difficulty: 4, status: 'active', totalDays: 30, detailLink: '/challenges/headstand' },
  { id: 'warrior',    name: 'Warrior III',  category: 'Balancing',   emoji: '🏹', grad: 'linear-gradient(160deg,#3f5560,#16222a)', difficulty: 3, status: 'completed', detailLink: '#' },
  { id: 'crow',       name: 'Crow Pose',    category: 'Strength',    emoji: '🦅', grad: 'linear-gradient(160deg,#5a3a3a,#241414)', difficulty: 3, status: 'upcoming', detailLink: '/challenges/crow' },
  { id: 'plank',      name: 'Plank Flow',   category: 'Strength',    emoji: '💪', grad: 'linear-gradient(160deg,#5a4632,#241b10)', difficulty: 2, status: 'upcoming', detailLink: '#' },
  { id: 'pigeon',     name: 'Pigeon Pose',  category: 'Mobility',    emoji: '🕊️', grad: 'linear-gradient(160deg,#3a5a4a,#142419)', difficulty: 2, status: 'upcoming', detailLink: '#' },
  { id: 'forwardfold',name: 'Forward Fold', category: 'Flexibility', emoji: '🙆', grad: 'linear-gradient(160deg,#4a3a5a,#1c1424)', difficulty: 2, status: 'upcoming', detailLink: '#' },
];
