
export function SnapYogaLogo() {
  return (
    <div className="flex items-center space-x-2" aria-label="SnapYoga Home">
      <svg
        width="40"
        height="40"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        className="h-10 w-10" // Ensures size consistency
        aria-hidden="true"    // Decorative, as the aria-label is on the parent div
      >
        {/* Torso/Head Pebble (Primary Color #695958) */}
        <ellipse cx="50" cy="50" rx="15" ry="20" fill="#695958" />

        {/* Arms (Secondary Color #19381F) - stroke-width adjusted for clarity */}
        {/* Back Arm */}
        <line x1="20" y1="48" x2="40" y2="48" stroke="#19381F" strokeWidth="5" strokeLinecap="round" />
        {/* Front Arm */}
        <line x1="60" y1="48" x2="80" y2="48" stroke="#19381F" strokeWidth="5" strokeLinecap="round" />

        {/* Legs (Secondary Color #19381F) */}
        {/* Back Leg (straight, angled back) */}
        <line x1="45" y1="68" x2="25" y2="85" stroke="#19381F" strokeWidth="5" strokeLinecap="round" />
        {/* Front Leg (bent) - Thigh */}
        <line x1="55" y1="68" x2="70" y2="80" stroke="#19381F" strokeWidth="5" strokeLinecap="round" />
        {/* Front Leg (bent) - Shin/Foot (horizontal) */}
        <line x1="70" y1="80" x2="85" y2="80" stroke="#19381F" strokeWidth="5" strokeLinecap="round" />
        
        {/* Smiley Face (Accent Color #E07A5F) on the upper part of the pebble */}
        <circle cx="47" cy="45" r="1.5" fill="#E07A5F"/>
        <circle cx="53" cy="45" r="1.5" fill="#E07A5F"/>
        <path d="M 47 51 Q 50 54 53 51" stroke="#E07A5F" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      </svg>
      <span className="text-2xl font-bold tracking-tight text-primary">SnapYoga</span>
    </div>
  );
}
