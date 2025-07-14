import Image from 'next/image';

export function SnapYogaLogo() {
  return (
    <div className="flex items-center space-x-2" aria-label="SnapYoga Home">
      <Image 
        src="/images/stacked-rocks-logo.png" 
        alt="SnapYoga Logo" 
        width={40} 
        height={40}
        className="h-10 w-10"
      />
      <span className="text-2xl font-bold tracking-tight text-primary">SnapYoga</span>
    </div>
  );
}
