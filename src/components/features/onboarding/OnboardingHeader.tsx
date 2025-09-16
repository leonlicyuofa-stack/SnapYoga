
"use client";

import { Card } from '@/components/ui/card';
import { WavingMascot } from '@/components/icons/WavingMascot';
import { usePathname } from 'next/navigation';

const pageTitles: Record<string, { title: string; subtitle: string; optionalText?: string }> = {
    '/onboarding/gender-profile': { title: 'Who are you?', subtitle: "Let's start with the basics." },
    '/onboarding/yoga-goal': { title: 'Your Yoga Goal', subtitle: "What do you want to achieve?" },
    '/onboarding/yoga-type': { title: 'Pose Interests', subtitle: "What poses excite you?" },
    '/onboarding/current-body-shape': { title: 'Current Shape', subtitle: "How do you see yourself now?", optionalText: "(optional)" },
    '/onboarding/desired-body-shape': { title: 'Desired Shape', subtitle: "What are your body goals?" },
    '/onboarding/almost-there': { title: 'Almost There!', subtitle: "Just a few more steps." },
    '/onboarding/focus-areas': { title: 'Focus Areas', subtitle: "Where do you want to improve?" },
    '/onboarding/profile-summary': { title: 'Your Summary', subtitle: "Let's review your profile." },
    '/onboarding/subscription': { title: 'Choose a Plan', subtitle: "Unlock your full potential." },
    '/onboarding/lucky-wheel': { title: 'Lucky Spin!', subtitle: "A special prize just for you." },
    '/onboarding/draw-result': { title: 'Your Prize', subtitle: "Here's what you've got!" },
};


export function OnboardingHeader() {
    const pathname = usePathname();
    const { title, subtitle, optionalText } = pageTitles[pathname] ?? { title: "Welcome!", subtitle: "Let's get you set up." };

    return (
        <Card className="bg-[#414869] text-white p-6 rounded-2xl shadow-lg mb-8 overflow-hidden relative max-w-sm w-full">
            <div className="flex flex-col items-start">
                <div className="flex space-x-1 mb-4">
                   <div className="w-2 h-2 rounded-full bg-[#FFB6C1]"></div>
                   <div className="w-2 h-2 rounded-full bg-[#FFB6C1]"></div>
                   <div className="w-2 h-2 rounded-full bg-[#FFB6C1]"></div>
                   <div className="w-2 h-2 rounded-full bg-[#FFB6C1]"></div>
                </div>
                <h2 className="text-4xl font-playfair font-bold">{title}</h2>
                <div>
                    <p className="text-lg opacity-80">{subtitle}</p>
                    {optionalText && <p className="text-sm italic opacity-80 mt-2">{optionalText}</p>}
                </div>
            </div>
            <WavingMascot className="absolute -right-10 -bottom-10 h-48 w-48" />
        </Card>
    );
}
