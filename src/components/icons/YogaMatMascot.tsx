
import type { SVGProps } from 'react';
import { cn } from '@/lib/utils';

export function YogaMatMascot(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="150" height="150" viewBox="0 0 150 150" xmlns="http://www.w3.org/2000/svg" {...props}>
        <g>
            <title>Yoga Mat Mascot</title>
            
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
