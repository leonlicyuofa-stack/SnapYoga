"use client";

import { ChallengeDetail, type TutorialWeek, type ChallengeFriend } from '@/components/features/challenges/challenge-detail';

const weeklyTutorials: TutorialWeek[] = [
  {
    week: 1,
    title: 'Safety and Strength',
    videos: [
      { day: 1, title: 'Foundation & Alignment', description: 'Learn the correct "tripod" hand and head placement, which is crucial for safety and stability. We will practice this without lifting our legs yet.', embedUrl: 'https://www.youtube.com/embed/tKAs69_N3aE' },
      { day: 3, title: 'Core Strengthening', description: 'Engage your core with preparatory poses like Dolphin Pose and plank variations. A strong core is the key to lifting your legs with control.', embedUrl: 'https://www.youtube.com/embed/jK0arm2R2gU' },
      { day: 5, title: 'Building Shoulder Strength', description: 'Focus on shoulder stability exercises to prepare them for bearing weight. This helps prevent injury and builds confidence.', embedUrl: 'https://www.youtube.com/embed/44mgUselcDU' },
    ],
  },
  {
    week: 2,
    title: 'Lifting Off',
    videos: [
      { day: 8, title: 'Practice Tucking', description: 'Today we start lifting! Learn to bring your knees to your chest in a tuck position, practicing balance on your tripod base.', embedUrl: 'https://www.youtube.com/embed/n3uQ227u1C8' },
      { day: 10, title: 'Extending One Leg', description: 'From the tuck, we will practice extending one leg at a time towards the ceiling. This builds control and balance.', embedUrl: 'https://www.youtube.com/embed/wg7-tV2fKAo' },
      { day: 12, title: 'Wall-Assisted Kick-ups', description: 'Use the wall for support to safely practice kicking up into a full headstand. The wall helps you find the feeling of being inverted.', embedUrl: 'https://www.youtube.com/embed/4R2-j2hD-i4' },
    ],
  },
];

const friends: ChallengeFriend[] = [
  { id: 'f1', name: 'Elena', daysIn: 12 },
  { id: 'f2', name: 'Marcus', daysIn: 8 },
];

export default function HeadstandChallengePage() {
  return (
    <ChallengeDetail
      id="headstand"
      name="Headstand (Sirsasana)"
      emoji="🧘"
      heroGrad="linear-gradient(160deg,#3a4a63,#16202c)"
      status="active"
      difficulty={4}
      description="This 30-day challenge is designed to safely guide you towards mastering the headstand (Sirsasana). We focus on building the necessary core strength, shoulder stability and balance. Always practice near a wall for support and listen to your body."
      totalParticipants={152}
      friendsCount={2}
      inviteLink="/challenges/headstand/invite"
      analyzeLabel="Analyze My Headstand"
      totalDays={30}
      weeklyTutorials={weeklyTutorials}
      friends={friends}
    />
  );
}
