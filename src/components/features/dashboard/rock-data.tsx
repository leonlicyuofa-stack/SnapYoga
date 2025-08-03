
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

export type RockRarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic';

export interface Rock {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  rarity: RockRarity;
  story: string;
}

export const allRocks: Rock[] = [
    { 
      id: 'welcome', 
      name: 'Welcome Rock', 
      description: 'Awarded for joining the SnapYoga community. Welcome!',
      color: '#e53935', // Primary red
      icon: WelcomeRock,
      rarity: 'Common',
      story: 'This smooth, warm stone represents the first step on a new path. It reminds us that every yoga journey begins with a single, simple intention.'
    },
    { 
      id: 'first-analysis', 
      name: 'First Analysis Rock', 
      description: 'Analyze your first yoga pose.', 
      color: '#43a047', // Green
      icon: FirstAnalysisRock,
      rarity: 'Common',
      story: 'A stone of clarity and insight. It symbolizes the moment you first sought to understand your practice more deeply. Its green hue represents growth.'
    },
    { 
      id: 'join-challenge', 
      name: 'Challenge Starter Rock', 
      description: 'Join your first challenge.',
      color: '#1e88e5', // Blue
      icon: ChallengeStarterRock,
      rarity: 'Uncommon',
      story: 'This vibrant blue stone holds the energy of courage and community. It marks your commitment to grow alongside others on a shared journey.'
    },
    { 
      id: 'give-feedback', 
      name: 'Feedback Friend Rock', 
      description: 'Provide feedback on an analysis.',
      color: '#fdd835', // Yellow
      icon: FeedbackFriendRock,
      rarity: 'Uncommon',
      story: 'A cheerful, bright stone that radiates helpfulness. It represents the wisdom shared and the cycle of learning and teaching within the yoga practice.'
    },
    { 
      id: 'perfect-score', 
      name: 'Perfectionist Pebble', 
      description: 'Achieve a perfect score of 100 on any pose.',
      color: '#8e24aa', // Purple
      icon: PerfectionistPebble,
      rarity: 'Epic',
      story: 'A rare and perfectly balanced gem. It embodies a moment of perfect harmony between mind, body, and spirit, where every alignment falls into place.'
    },
    { 
      id: 'five-analyses', 
      name: 'Consistent Yogi Stone', 
      description: 'Complete 5 pose analyses.', 
      color: '#fb8c00', // Orange
      icon: ConsistentYogiStone,
      rarity: 'Rare',
      story: 'This steady, layered stone is a testament to dedication. Each layer represents a session of practice, building a strong and stable foundation over time.'
    },
    {
      id: 'social-butterfly',
      name: 'Social Butterfly Rock',
      description: 'Invite a friend to join SnapYoga.',
      color: '#d81b60', // Pink
      icon: SocialButterflyRock,
      rarity: 'Rare',
      story: 'A stone that glows with the warmth of connection. It celebrates the act of sharing the gift of yoga with others, creating a stronger community.'
    },
    {
      id: 'early-bird',
      name: 'Early Bird Rock',
      description: 'Complete a session before 8 AM.',
      color: '#00acc1', // Cyan
      icon: EarlyBirdRock,
      rarity: 'Uncommon',
      story: 'This cool, serene stone captures the quiet energy of the morning. It is awarded to those who rise with the sun to greet their mat.'
    }
];

    
