
import type { SVGProps } from 'react';

export function SmileyPebbleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="40" // Intrinsic width, can be overridden by className
      height="40" // Intrinsic height, can be overridden by className
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props} // Allows passing className for sizing, etc.
    >
      {/* Bottom Pebble (Secondary Color #19381F) */}
      <ellipse cx="50" cy="80" rx="30" ry="15" fill="#19381F" />
      {/* Middle Pebble (Primary Color #695958) */}
      <ellipse cx="50" cy="60" rx="25" ry="12" fill="#695958" />
      {/* Top Pebble (Accent Color #E07A5F) */}
      <ellipse cx="50" cy="40" rx="20" ry="10" fill="#E07A5F" />
      {/* Smiley Face (Secondary Color #19381F) on the top pebble */}
      <circle cx="45" cy="38" r="1.5" fill="#19381F"/>
      <circle cx="55" cy="38" r="1.5" fill="#19381F"/>
      <path d="M 45 43 Q 50 46 55 43" stroke="#19381F" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    </svg>
  );
}
