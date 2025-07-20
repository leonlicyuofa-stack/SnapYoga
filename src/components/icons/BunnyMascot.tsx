
import type { SVGProps } from 'react';
import { cn } from '@/lib/utils';

export function BunnyMascot(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="150" height="150" viewBox="-20 -30 150 150" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g className="transition-transform duration-500 ease-in-out">
        <title>Bunny Mascot</title>
        
        {/* Main group for the character */}
        <g id="character-group" className="origin-center" style={{ animation: `character-sway 2.5s ease-in-out infinite` }}>
            {/* Legs */}
            <path id="leg-back" d="M 55 105 Q 50 115 60 120" stroke="currentColor" fill="none" strokeWidth="8" strokeLinecap="round" style={{ animation: `walk-back 1.25s ease-in-out infinite` }}/>
            <path id="leg-front" d="M 75 105 Q 80 115 70 120" stroke="currentColor" fill="none" strokeWidth="8" strokeLinecap="round" style={{ animation: `walk-front 1.25s ease-in-out infinite` }}/>

            {/* Body */}
            <path d="M 65,120 C 35,125 20,90 40,70 C 60,50 90,50 110,70 C 130,90 115,125 85,120 Z" fill="#FFFDE7" stroke="currentColor" strokeWidth="0.5" />

            {/* Head and Face group for rotation */}
            <g id="head-group" className="origin-center" style={{ animation: 'head-turn 25s ease-in-out infinite -8s' }}>
                <path d="M 75,40 C 50,40 45,60 55,80 C 65,100 85,100 95,80 C 105,60 100,40 75,40 Z" fill="#FFFDE7" stroke="currentColor" strokeWidth="0.5" />
                
                {/* Ears */}
                <path d="M 65,20 C 55,0 70,-5 75,20 C 80,45 75,40 65,20 Z" fill="#FFFDE7" stroke="currentColor" strokeWidth="0.5" />
                <path d="M 85,20 C 95,0 80,-5 75,20 C 70,45 75,40 85,20 Z" fill="#FFFDE7" stroke="currentColor" strokeWidth="0.5" />
                <path d="M 68,25 C 65,15 70,12 73,25 C 76,38 72,35 68,25 Z" fill="#FFE0B2" />

                {/* Face - walking */}
                <g id="face-walking" style={{ animation: 'face-fade 25s ease-in-out infinite -8s' }}>
                    <ellipse cx="80" cy="72" rx="3" ry="4" fill="currentColor" />
                    <path d="M 73,78 Q 75,81 77,78" stroke="currentColor" fill="none" strokeWidth="1.5" strokeLinecap="round"/>
                </g>
                 {/* Face - smiling */}
                <g id="face-smiling" style={{ opacity: 0, animation: 'face-fade-in 25s ease-in-out infinite -8s' }}>
                    <path d="M65,70 C 68,67 71,67 74,70" stroke="currentColor" fill="none" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M80,70 C 83,67 86,67 89,70" stroke="currentColor" fill="none" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M 70,78 Q 78,85 86,78" stroke="currentColor" fill="none" strokeWidth="1.5" strokeLinecap="round"/>
                </g>
            </g>

            {/* Arms */}
            <path id="arm-back" d="M 50,90 Q 40 95 45 105" stroke="currentColor" fill="none" strokeWidth="8" strokeLinecap="round" style={{ animation: `walk-front 1.25s ease-in-out infinite` }}/>
            <path id="arm-front" d="M 95,90 Q 105 95 100 105" stroke="currentColor" fill="none" strokeWidth="8" strokeLinecap="round" style={{ animation: `walk-back 1.25s ease-in-out infinite` }}/>
        </g>
        
        <style>{`
            @keyframes walk-front { 0%, 100% { transform: rotate(-15deg); } 50% { transform: rotate(15deg); } }
            @keyframes walk-back { 0%, 100% { transform: rotate(15deg); } 50% { transform: rotate(-15deg); } }
            @keyframes character-sway { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-3px) rotate(2deg); } }
            @keyframes head-turn { 
                0%, 59%, 81%, 100% { transform: rotateY(0deg); }
                60%, 80% { transform: rotateY(180deg); } 
            }
            @keyframes face-fade {
                0%, 59%, 81%, 100% { opacity: 1; }
                60%, 80% { opacity: 0; }
            }
            @keyframes face-fade-in {
                0%, 59%, 81%, 100% { opacity: 0; }
                60%, 80% { opacity: 1; }
            }
        `}</style>
      </g>
    </svg>
  );
}
