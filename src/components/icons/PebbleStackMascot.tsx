import type { SVGProps } from 'react';

export function PebbleStackMascot(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="150" height="120" viewBox="0 0 150 120" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g>
        <title>Pebble Stack Mascot</title>
        
        {/* Main Body with Turn Animation */}
        <g className="animate-mascot-head" style={{ transformOrigin: 'center' }}>
            {/* Back of head (initially visible) */}
            <path d="M 15,100 C 5,90 5,70 20,65 C 35,60 75,60 90,70 C 105,80 105,95 85,105 C 65,115 25,110 15,100 Z" fill="#b0bec5" stroke="#263238" strokeWidth="0.5" />
            
            {/* Front of head (revealed on turn) */}
            <g style={{ transform: 'rotateY(180deg)', transformOrigin: 'center' }}>
                <path d="M 15,100 C 5,90 5,70 20,65 C 35,60 75,60 90,70 C 105,80 105,95 85,105 C 65,115 25,110 15,100 Z" fill="#D1E8E2" stroke="#2C3E50" strokeWidth="0.5" />
                <ellipse cx="45" cy="85" rx="4" ry="5" fill="#2C3E50" />
                <ellipse cx="65" cy="85" rx="4" ry="5" fill="#2C3E50" />
                <path d="M 50,92 Q 55,98 60,92" stroke="#2C3E50" fill="none" strokeWidth="0.5" strokeLinecap="round" />
            </g>
        </g>

        {/* Arm with Wave Animation */}
        <g className="animate-mascot-arm">
            <path d="M 80,90 C 90,85 95,75 90,70 C 85,65 75,70 80,90 Z" fill="#D1E8E2" stroke="#2C3E50" strokeWidth="0.5" />
        </g>

        {/* Middle and Top Pebbles (Static) */}
        <path d="M 25,68 C 18,63 20,50 30,45 C 40,40 70,42 80,50 C 90,58 88,68 75,72 C 62,76 32,73 25,68 Z" fill="#B2CEDE" stroke="#2C3E50" strokeWidth="0.5" />
        <path d="M 35,48 C 30,45 32,35 40,32 C 48,29 62,32 68,38 C 74,44 70,50 60,51 C 50,52 40,51 35,48 Z" fill="#93B7BE" stroke="#2C3E50" strokeWidth="0.5" />
        
        {/* Speech Bubble with Text */}
        <g className="animate-speech-bubble">
            <path d="M 95,40 C 92,30 130,25 140,35 C 150,45 140,55 130,52 L 105,55 Z" fill="white" stroke="#2C3E50" strokeWidth="0.5" />
            <text x="102" y="44" fontFamily="sans-serif" fontSize="10" fill="#2C3E50" fontWeight="bold">Welcome!</text>
        </g>

      </g>
    </svg>
  );
}
