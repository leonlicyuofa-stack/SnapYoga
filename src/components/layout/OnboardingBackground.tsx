
export function OnboardingBackground() {
  return (
    <div className="absolute inset-0 z-0">
      <svg width="100%" height="100%" viewBox="0 0 1440 1024" preserveAspectRatio="xMidYMid slice" className="absolute inset-0">
        <defs>
          <filter id="soft-blur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="15" />
          </filter>
        </defs>
        <g filter="url(#soft-blur)">
          <path d="M -50,0 L 1490,0 L 1490,200 Q 720,250 -50,200 Z" fill="#E1D9F0" opacity="0.6" />
          <path d="M -50,180 Q 720,230 1490,180 L 1490,380 Q 720,430 -50,380 Z" fill="#F0D9E7" opacity="0.6" />
          <path d="M -50,360 Q 720,410 1490,360 L 1490,560 Q 720,610 -50,560 Z" fill="#D9E7F0" opacity="0.6" />
          <path d="M -50,540 Q 720,590 1490,540 L 1490,740 Q 720,790 -50,740 Z" fill="#D9F0E1" opacity="0.6" />
          <path d="M -50,720 Q 720,770 1490,720 L 1490,920 Q 720,970 -50,920 Z" fill="#F0EFD9" opacity="0.6" />
          <path d="M -50,900 Q 720,950 1490,900 L 1490,1100 L -50,1100 Z" fill="#F0D9D9" opacity="0.6" />
        </g>
      </svg>
    </div>
  );
}
