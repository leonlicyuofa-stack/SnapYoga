"use client";

import { ChallengeDetail, type TutorialWeek, type ChallengeFriend } from '@/components/features/challenges/challenge-detail';

const weeklyTutorials: TutorialWeek[] = [
  {
    week: 1,
    title: 'Building the Foundation',
    videos: [
      { day: 1, title: 'Wrist & Hand Preparation', description: 'Crow pose puts a lot of pressure on the wrists. Today, we focus on warm-ups and correct hand placement to build a solid, safe foundation.', embedUrl: 'https://www.youtube.com/embed/wg7-tV2fKAo' },
      { day: 3, title: 'Core & Hip Flexor Activation', description: 'Learn to engage your deep core muscles and hip flexors. This is the secret to getting your knees high up on your arms and feeling light.', embedUrl: 'https://www.youtube.com/embed/4R2-j2hD-i4' },
      { day: 5, title: 'The "Shelf": Knee-to-Arm Connection', description: 'Practice creating a stable shelf with your upper arms for your knees. We will work on drills to find this connection without lifting off yet.', embedUrl: 'https://www.youtube.com/embed/kZUa_d_W6fA' },
    ],
  },
  {
    week: 2,
    title: 'Learning to Fly',
    videos: [
      { day: 8, title: 'Weight Shifting & The Lean', description: 'Confidence comes from learning to shift your weight forward. Using blocks for support, we will practice leaning into our hands safely.', embedUrl: 'https://www.youtube.com/embed/O-MvQ42I36I' },
      { day: 10, title: 'Lifting One Foot at a Time', description: 'The moment of truth! From the leaned position, we will practice lifting one foot, then the other, getting used to the feeling of flying.', embedUrl: 'https://www.youtube.com/embed/tKAs69_N3aE' },
      { day: 12, title: 'Holding Crow & Controlled Exit', description: 'Once you find your balance, holding the pose is the next step. We will also practice how to exit the pose gracefully and safely.', embedUrl: 'https://www.youtube.com/embed/jK0arm2R2gU' },
    ],
  },
];

const friends: ChallengeFriend[] = [
  { id: 'f3', name: 'Anya', daysIn: 5 },
];

export default function CrowPoseChallengePage() {
  return (
    <ChallengeDetail
      id="crow"
      name="Crow Pose (Bakasana)"
      emoji="🦅"
      heroGrad="linear-gradient(160deg,#5a3a3a,#241414)"
      status="upcoming"
      difficulty={3}
      description="Ready to take flight? This challenge focuses on building the arm and core strength, balance, and confidence needed for Crow Pose. We'll break it down into manageable steps to help you lift off."
      totalParticipants={87}
      friendsCount={1}
      inviteLink="/challenges/crow/invite"
      analyzeLabel="Analyze My Crow Pose"
      weeklyTutorials={weeklyTutorials}
      friends={friends}
    />
  );
}
