
import type { SVGProps } from 'react';

export function HappyLifeGraphic(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="300" height="120" viewBox="0 0 320 120" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g fontFamily="sans-serif" fontSize="14" fontWeight="bold" textAnchor="middle">

        {/* Healthy Body -> Move with Purpose */}
        <g transform="translate(50, 50)">
          <circle cx="0" cy="-15" r="15" fill="#E5D2B8" stroke="#231F20" strokeWidth="1.5" />
          <path d="M0,0 L-12,35 L12,35 Z" fill="#E5D2B8" stroke="#231F20" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
          <path d="M-10,0 C-20,10 -15,25 -10,35" fill="none" stroke="#231F20" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M10,0 C20,10 15,25 10,35" fill="none" stroke="#231F20" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M-5,-18 L-2,-20 L-5,-22" stroke="#231F20" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M5,-18 L2,-20 L5,-22" stroke="#231F20" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M-5,-12 Q0,-8 5,-12" stroke="#231F20" strokeWidth="1.5" fill="none" />
        </g>
        <text x="50" y="100">move</text>
        <text x="50" y="115">with purpose</text>


        {/* Plus */}
        <text x="110" y="70" fontSize="20">+</text>

        {/* Healthy Mind */}
        <g transform="translate(160, 50)">
          <circle cx="0" cy="-15" r="15" fill="#C4E8F7" stroke="#231F20" strokeWidth="1.5" />
          <path d="M0,0 C-15,25 15,25 0,0 M-20,30 L-10,20 L0,30 L10,20 L20,30" fill="none" stroke="#231F20" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
          <path d="M-15,-5 L-5,10 L0,0 L5,10 L15,-5" fill="none" stroke="#231F20" strokeWidth="1.5" />
          <path d="M-7,-20 q2.5,-2.5 5,0" stroke="#231F20" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
          <path d="M7,-20 q-2.5,-2.5 -5,0" stroke="#231F20" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
          <path d="M-5,-12 Q0,-10 5,-12" stroke="#231F20" strokeWidth="1.5" fill="none" />
        </g>
        <text x="160" y="100">healthy</text>
        <text x="160" y="115">mind</text>

        {/* Equals */}
        <text x="220" y="70" fontSize="20">=</text>

        {/* Happy Life */}
        <g transform="translate(270, 50)">
          {/* Sparkle */}
          <path d="M0,-45 L5,-35 L15,-35 L10,-25 L20,-20 L10,-15 L15,-5 L5,-10 L0,0 L-5,-10 L-15,-5 L-10,-15 L-20,-20 L-10,-25 L-15,-35 L-5,-35 Z" fill="#FFF7A0" stroke="#FDE321" strokeWidth="1"/>

          <circle cx="0" cy="-15" r="15" fill="#F8B1B1" stroke="#231F20" strokeWidth="1.5" />
          <path d="M0,0 C-15,25 15,25 0,0 L-12,35 L0,25 L12,35 Z" fill="#F8B1B1" stroke="#231F20" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
          <path d="M-15,5 C-20,-15 -5,-25 0,-15 C5,-25 20,-15 15,5" fill="none" stroke="#231F20" strokeWidth="1.5" />

          <path d="M-7,-20 l3,3 l-3,3" stroke="#231F20" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M7,-20 l-3,3 l3,3" stroke="#231F20" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M-5,-10 Q0,-5 5,-10" stroke="#231F20" strokeWidth="1.5" fill="none" />
        </g>
        <text x="270" y="100">happy</text>
        <text x="270" y="115">life</text>

      </g>
    </svg>
  );
}
