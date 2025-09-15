import type { SVGProps } from 'react';

export function SmileyBlobMascot(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <g>
            <title>Smiley Blob Mascot</title>
            {/* Background Circle */}
            <circle cx="60" cy="60" r="50" fill="#FDEBD0" />
            
            {/* Main Blob Shape */}
            <path d="M89.3,27.3C79.8,21,68.9,21.9,60.1,28.2C53.2,33.1,49,41.4,49.7,49.5C50.4,57.6,56,64.2,63.4,66.7C70.8,69.2,79.1,67.6,85,62.8C94.4,55.3,98.8,33.5,89.3,27.3Z" fill="#4A90E2" />

            {/* Face */}
            <path d="M68,44 C69,45 70,45 71,44" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M76,44 C77,45 78,45 79,44" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M70,52 C72,55 76,55 78,52" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />

            {/* Swirl */}
            <path d="M75,34 C78,32 80,35 78,37 C76,39 73,38 74,35" stroke="#2C3E50" fill="none" strokeWidth="1.5" strokeLinecap="round" />

            {/* Red Scribble */}
            <path d="M85,50 C88,48,91,52,88,54 C85,56,82,55,83,52 C84,49,87,50,85,52" stroke="#E94E77" fill="none" strokeWidth="2" strokeLinecap="round" />

        </g>
    </svg>
  );
}
