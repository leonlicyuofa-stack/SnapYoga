
"use client";

import type { ComponentType, SVGProps } from 'react';

// The icons are no longer used, we will use imageUrls instead.

export type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic';

export interface Collectible {
  id: string;
  name: string;
  description: string;
  color: string;
  imageUrl: string; // Changed from 'icon' to 'imageUrl'
  rarity: Rarity;
  story: string;
}

export const allCollectibles: Collectible[] = [
    { 
      id: 'welcome_mat', 
      name: 'Welcome Mat', 
      description: 'Awarded for joining the SnapYoga community. Welcome!',
      color: '#6D8A94', // A calm, welcoming blue-grey
      imageUrl: 'https://picsum.photos/seed/yogamat/100/100',
      rarity: 'Common',
      story: 'The foundation of every practice. This mat represents the first step on a new path.'
    },
    { 
      id: 'first_analysis_block', 
      name: 'Insight Block', 
      description: 'Analyze your first yoga pose.', 
      color: '#C7AFA5', // A warm, earthy cork color
      imageUrl: 'https://picsum.photos/seed/yogablock/100/100',
      rarity: 'Common',
      story: 'A tool for support and deeper understanding. It symbolizes the moment you first sought to understand your practice.'
    },
    { 
      id: 'join_challenge_strap', 
      name: 'Challenge Strap', 
      description: 'Join your first challenge.',
      color: '#8A9A5B', // Olive green
      imageUrl: 'https://picsum.photos/seed/yogastrap/100/100',
      rarity: 'Uncommon',
      story: 'This strap represents reaching for new goals and the connection of a shared journey with the community.'
    },
    { 
      id: 'feedback_bolster', 
      name: 'Feedback Bolster', 
      description: 'Provide feedback on an analysis.',
      color: '#BDB3D1', // Lavender
      imageUrl: 'https://picsum.photos/seed/yogabolster/100/100',
      rarity: 'Uncommon',
      story: 'A cushion for restorative feedback. It represents the wisdom shared and the cycle of learning and teaching.'
    },
    { 
      id: 'perfect_score_wheel', 
      name: 'Wheel of Perfection', 
      description: 'Achieve a perfect score of 100 on any pose.',
      color: '#D4AF37', // Gold
      imageUrl: 'https://picsum.photos/seed/yogawheel/100/100',
      rarity: 'Epic',
      story: 'A rare and perfectly balanced circle. It embodies a moment of perfect harmony between mind, body, and spirit.'
    },
    { 
      id: 'five_analyses_towel', 
      name: 'Towel of Tenacity', 
      description: 'Complete 5 pose analyses.', 
      color: '#4682B4', // Steel blue
      imageUrl: 'https://picsum.photos/seed/yogatowel/100/100',
      rarity: 'Rare',
      story: 'This absorbent towel is a testament to dedication and consistent effort, soaking up the rewards of practice.'
    },
    {
      id: 'social_butterfly_bottle',
      name: 'Community Carafe',
      description: 'Invite a friend to join SnapYoga.',
      color: '#FFC0CB', // Pink
      imageUrl: 'https://picsum.photos/seed/yogabottle/100/100',
      rarity: 'Rare',
      story: 'A vessel that holds the refreshing spirit of connection. It celebrates sharing the gift of yoga with others.'
    },
    {
      id: 'early_bird_blanket',
      name: 'Dawn Blanket',
      description: 'Complete a session before 8 AM.',
      color: '#FFDAB9', // Peach
      imageUrl: 'https://picsum.photos/seed/yogablanket/100/100',
      rarity: 'Uncommon',
      story: 'This warm, serene blanket captures the quiet energy of the morning, awarded to those who rise with the sun.'
    }
];
