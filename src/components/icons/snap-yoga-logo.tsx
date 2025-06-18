
export function SnapYogaLogo() {
  return (
    <div className="flex items-center space-x-2" aria-label="SnapYoga Home">
      <svg
        width="40"
        height="40"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-10 w-10" // Ensures size consistency
        aria-hidden="true"    // Decorative, as the aria-label is on the parent div
      >
        {/* Bottom pebble: Primary Color (#695958) */}
        <ellipse cx="50" cy="80" rx="35" ry="15" fill="#695958"/>
        {/* Middle pebble: Secondary Color (#19381F) */}
        <ellipse cx="50" cy="55" rx="25" ry="12" fill="#19381F"/>
        {/* Top pebble: Accent Color (#E07A5F) */}
        <ellipse cx="50" cy="33" rx="18" ry="10" fill="#E07A5F"/>
        {/* Smiley Face on Top Pebble */}
        {/* Eyes - using secondary color */}
        <circle cx="46" cy="31" r="1.5" fill="#19381F"/>
        <circle cx="54" cy="31" r="1.5" fill="#19381F"/>
        {/* Smile - using secondary color */}
        <path d="M 46 36 Q 50 39 54 36" stroke="#19381F" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      </svg>
      <span className="text-2xl font-bold tracking-tight text-primary">SnapYoga</span>
    </div>
  );
}
