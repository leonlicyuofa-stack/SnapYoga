
"use client";

import type { ComponentType, SVGProps } from 'react';
import { WelcomeRock } from '@/components/icons/rocks/welcome-rock';
import { FirstAnalysisRock } from '@/components/icons/rocks/first-analysis-rock';
import { ChallengeStarterRock } from '@/components/icons/rocks/challenge-starter-rock';
import { FeedbackFriendRock } from '@/components/icons/rocks/feedback-friend-rock';
import { PerfectionistPebble } from '@/components/icons/rocks/perfectionist-pebble';
import { ConsistentYogiStone } from '@/components/icons/rocks/consistent-yogi-stone';
import { SocialButterflyRock } from '@/components/icons/rocks/social-butterfly-rock';
import { EarlyBirdRock } from '@/components/icons/rocks/early-bird-rock';

export interface Rock {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

export const allRocks: Rock[] = [
    { 
      id: 'welcome', 
      name: 'Welcome Rock', 
      description: 'Awarded for joining the SnapYoga community. Welcome!',
      color: '#e53935', // Primary red
      icon: WelcomeRock,
    },
    { 
      id: 'first-analysis', 
      name: 'First Analysis Rock', 
      description: 'Analyze your first yoga pose.', 
      color: '#43a047', // Green
      icon: FirstAnalysisRock 
    },
    { 
      id: 'join-challenge', 
      name: 'Challenge Starter Rock', 
      description: 'Join your first challenge.',
      color: '#1e88e5', // Blue
      icon: ChallengeStarterRock 
    },
    { 
      id: 'give-feedback', 
      name: 'Feedback Friend Rock', 
      description: 'Provide feedback on an analysis.',
      color: '#fdd835', // Yellow
      icon: FeedbackFriendRock 
    },
    { 
      id: 'perfect-score', 
      name: 'Perfectionist Pebble', 
      description: 'Achieve a perfect score of 100 on any pose.',
      color: '#8e24aa', // Purple
      icon: PerfectionistPebble 
    },
    { 
      id: 'five-analyses', 
      name: 'Consistent Yogi Stone', 
      description: 'Complete 5 pose analyses.', 
      color: '#fb8c00', // Orange
      icon: ConsistentYogiStone 
    },
    {
      id: 'social-butterfly',
      name: 'Social Butterfly Rock',
      description: 'Invite a friend to join SnapYoga.',
      color: '#d81b60', // Pink
      icon: SocialButterflyRock
    },
    {
      id: 'early-bird',
      name: 'Early Bird Rock',
      description: 'Complete a session before 8 AM.',
      color: '#00acc1', // Cyan
      icon: EarlyBirdRock
    }
];

    