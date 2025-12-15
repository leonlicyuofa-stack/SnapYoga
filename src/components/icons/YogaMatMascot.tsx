
import type { SVGProps } from 'react';
import { cn } from '@/lib/utils';

export function YogaMatMascot(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="150" height="150" viewBox="0 0 150 150" xmlns="http://www.w3.org/2000/svg" {...props}>
        <g>
            <title>Yoga Mat Mascot</title>
            
            {/* Thought Bubble */}
            <g className="animate-pulse" transform="translate(45, -30)">
                <g transform="translate(15, 0) scale(0.6)">
                    <path d="M68.4,18.8c-11.5,0-20.8,9.3-20.8,20.8c0,8.3,4.9,15.5,11.9,18.8 c-1.5-1.1-3.2-1.7-5.1-1.7c-6.1,0-11,4.9-11,11s4.9,11,11,11c2.1,0,4.1-0.6,5.8-1.8c4.3,2.9,9.5,4.7,15.2,4.7 c14.2,0,25.8-11.5,25.8-25.8S82.6,18.8,68.4,18.8z" fill="#FFFFFF" stroke="#4a2c2a" strokeWidth="3"/>
                    <path d="M43.4,56.7c-0.6-0.8-1.3-1.4-2.2-1.7" fill="none" stroke="#4a2c2a" strokeWidth="3" strokeLinecap="round"/>
                    <path d="M37.3,77.8c1.3,0.6,2.8,1,4.3,1" fill="none" stroke="#4a2c2a" strokeWidth="3" strokeLinecap="round"/>
                    <path d="M68.4,15.8c-1.3,0-2.6,0.1-3.8,0.3" fill="none" stroke="#4a2c2a" strokeWidth="3" strokeLinecap="round"/>
                    <path d="M91.8,47.4c0.8-1.4,1.4-3,1.6-4.6" fill="none" stroke="#4a2c2a" strokeWidth="3" strokeLinecap="round"/>
                    <path d="M94,44.6c0,2.1-0.3,4.1-0.8,6" fill="none" stroke="#4a2c2a" strokeWidth="3" strokeLinecap="round"/>
                    <path d="M81.2,70.9c-3.3,2.4-7.2,3.9-11.3,4.3" fill="none" stroke="#4a2c2a" strokeWidth="3" strokeLinecap="round"/>
                    <path d="M47.6,19.8c-2.4,3.1-4,6.9-4,11.1" fill="none" stroke="#4a2c2a" strokeWidth="3" strokeLinecap="round"/>
                    <path d="M47.6,21.8c-3,3.8-4.9,8.5-4.9,13.6" fill="none" stroke="#4a2c2a" strokeWidth="3" strokeLinecap="round"/>
                    <path d="M47.6,39.6c-1.6,0-3.1-0.3-4.5-0.8" fill="none" stroke="#4a2c2a" strokeWidth="3" strokeLinecap="round"/>
                    <circle cx="25" cy="85" r="7" fill="#FFFFFF" stroke="#4a2c2a" strokeWidth="3"/>
                    <circle cx="15" cy="100" r="5" fill="#FFFFFF" stroke="#4a2c2a" strokeWidth="3"/>
                </g>
                <text x="32.5" y="28" fontFamily="sans-serif" fontSize="12" fill="#2C3E50" fontWeight="bold">Hi!</text>
            </g>
            
            {/* Background circle */}
            <circle cx="75" cy="75" r="50" fill="white" fillOpacity="0.8" />
            
            {/* Main Mat Roll */}
            <rect x="25" y="55" width="100" height="40" rx="20" fill="#64748B" />

            {/* Rolled Ends */}
            <ellipse cx="25" cy="75" rx="10" ry="20" fill="#525F75" />
            <ellipse cx="125" cy="75" rx="10" ry="20" fill="#525F75" />
            
            {/* Straps */}
            <rect x="40" y="50" width="15" height="50" rx="5" fill="#2C3E50" />
            <rect x="95" y="50" width="15" height="50" rx="5" fill="#2C3E50" />
            
            {/* Handle */}
            <path d="M 47.5 50 Q 75 25, 102.5 50" stroke="#2C3E50" fill="none" strokeWidth="10" strokeLinecap="round" />
            
            {/* Feet */}
            <g className="origin-[65px_95px] animate-swing">
                <circle cx="65" cy="100" r="8" fill="#2C3E50" />
            </g>
            <g className="origin-[85px_95px] animate-swing" style={{ animationDelay: '100ms' }}>
                <circle cx="85" cy="100" r="8" fill="#2C3E50" />
            </g>

            {/* Face */}
            <circle cx="70" cy="72" r="2" fill="#2C3E50" />
            <circle cx="80" cy="72" r="2" fill="#2C3E50" />
            <path d="M 72 80 Q 75 85, 78 80" stroke="#2C3E50" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </g>
    </svg>
  );
}
