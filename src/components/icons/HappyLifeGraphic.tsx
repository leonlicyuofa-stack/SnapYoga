
import type { SVGProps } from 'react';

export function HappyLifeGraphic(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="300" height="120" viewBox="0 0 320 120" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g fontSize="14" fontWeight="bold" textAnchor="middle" fill="hsl(var(--foreground))" stroke="hsl(var(--foreground))">

        {/* Healthy Body -> Move with Purpose */}
        <g transform="translate(50, 50)">
          <circle cx="0" cy="-15" r="15" fill="hsl(var(--pistachio-background))" stroke="none" />
          <path d="M0,0 L-12,35 L12,35 Z" fill="hsl(var(--pistachio-background))" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
          <path d="M-10,0 C-20,10 -15,25 -10,35" fill="none" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M10,0 C20,10 15,25 10,35" fill="none" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M-5,-18 L-2,-20 L-5,-22" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M5,-18 L2,-20 L5,-22" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M-5,-12 Q0,-8 5,-12" fill="none" strokeWidth="1.5" />
        </g>
        <text x="50" y="100">move</text>
        <text x="50" y="115">with purpose</text>

        {/* Plus */}
        <text x="110" y="70" fontSize="20">+</text>

        {/* Healthy Mind (originally second, now third) */}
        <g transform="translate(160, 50)">
          <circle cx="0" cy="-15" r="15" fill="hsl(var(--secondary))" stroke="none"/>
          <path d="M0,0 C-15,25 15,25 0,0 M-20,30 L-10,20 L0,30 L10,20 L20,30" fill="none" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
          <path d="M-15,-5 L-5,10 L0,0 L5,10 L15,-5" fill="none" strokeWidth="1.5" />
          <path d="M-7,-20 q2.5,-2.5 5,0" fill="none" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M7,-20 q-2.5,-2.5 -5,0" fill="none" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M-5,-12 Q0,-10 5,-12" fill="none" strokeWidth="1.5" />
        </g>
        <text x="160" y="100">breathe</text>
        <text x="160" y="115">with peace</text>

        {/* Equals */}
        <text x="220" y="70" fontSize="20">=</text>

        {/* Happy Life (originally third, now second) */}
        <g transform="translate(270, 50)">
          <circle cx="0" cy="-15" r="15" fill="hsl(var(--accent))" stroke="none"/>
          <path d="M0,0 C-15,25 15,25 0,0 L-12,35 L0,25 L12,35 Z" fill="hsl(var(--accent))" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
          <path d="M-15,5 C-20,-15 -5,-25 0,-15 C5,-25 20,-15 15,5" fill="none" strokeWidth="1.5" />
          <path d="M-7,-20 l3,3 l-3,3" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M7,-20 l-3,3 l3,3" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M-5,-10 Q0,-5 5,-10" fill="none" strokeWidth="1.5" />
        </g>
        <text x="270" y="100">happy</text>
        <text x="270" y="115">life</text>

      </g>
    </svg>
  );
}
