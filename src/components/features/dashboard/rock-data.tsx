
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
      imageUrl: '/images/EQ_Yoga Matt.png',
      rarity: 'Common',
      story: 'The foundation of every practice. This mat represents the first step on a new path.'
    },
    { 
      id: 'first_analysis_block', 
      name: 'Insight Block', 
      description: 'Analyze your first yoga pose.', 
      color: '#C7AFA5', // A warm, earthy cork color
      imageUrl: '/images/EQ_Yoga_Block.png',
      rarity: 'Common',
      story: 'A tool for support and deeper understanding. It symbolizes the moment you first sought to understand your practice.'
    },
    { 
      id: 'join_challenge_strap', 
      name: 'Challenge Strap', 
      description: 'Join your first challenge.',
      color: '#8A9A5B', // Olive green
      imageUrl: '/images/EQ_Yoga_Strap.png',
      rarity: 'Uncommon',
      story: 'This strap represents reaching for new goals and the connection of a shared journey with the community.'
    },
    { 
      id: 'feedback_bolster', 
      name: 'Meditation Cushion', 
      description: 'Provide feedback on an analysis.',
      color: '#BDB3D1', // Lavender
      imageUrl: '/images/EQ_Meditation Cushion.png',
      rarity: 'Uncommon',
      story: 'A cushion for restorative feedback. It represents the wisdom shared and the cycle of learning and teaching.'
    },
    { 
      id: 'perfect_score_wheel', 
      name: 'Wheel of Perfection', 
      description: 'Achieve a perfect score of 100 on any pose.',
      color: '#D4AF37', // Gold
      imageUrl: '/images/EQ_Yoga_Wheel.png',
      rarity: 'Epic',
      story: 'A rare and perfectly balanced circle. It embodies a moment of perfect harmony between mind, body, and spirit.'
    },
    { 
      id: 'five_analyses_towel', 
      name: 'Towel of Tenacity', 
      description: 'Complete 5 pose analyses.', 
      color: '#4682B4', // Steel blue
      imageUrl: '/images/EQ_Yoga_Towels.png',
      rarity: 'Rare',
      story: 'This absorbent towel is a testament to dedication and consistent effort, soaking up the rewards of practice.'
    },
    {
      id: 'social_butterfly_bottle',
      name: 'Community Carafe',
      description: 'Invite a friend to join SnapYoga.',
      color: '#FFC0CB', // Pink
      imageUrl: '/images/EQ_Yoga Bottle.png',
      rarity: 'Rare',
      story: 'A vessel that holds the refreshing spirit of connection. It celebrates sharing the gift of yoga with others.'
    },
    {
      id: 'early_bird_blanket',
      name: 'Grip Socks',
      description: 'Complete a session before 8 AM.',
      color: '#FFDAB9', // Peach
      imageUrl: '/images/EQ_Yoga_Grip_Socks.png',
      rarity: 'Uncommon',
      story: 'This warm, serene blanket captures the quiet energy of the morning, awarded to those who rise with the sun.'
    }
];
