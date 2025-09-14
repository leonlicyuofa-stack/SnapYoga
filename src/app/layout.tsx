
import type {Metadata} from 'next';
import { Lexend, Playfair_Display, Chakra_Petch } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/contexts/AuthContext'; 
import { LanguageProvider } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

const lexend = Lexend({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-lexend',
});

const playfair = Playfair_Display({
    subsets: ['latin'],
    weight: ['400', '700'],
    variable: '--font-playfair-display',
});

const chakraPetch = Chakra_Petch({
    subsets: ['latin'],
    weight: ['400', '700'],
    style: 'normal',
    variable: '--font-chakra-petch',
});

export const metadata: Metadata = {
  title: 'SnapYoga',
  description: 'AI-powered yoga pose analysis and feedback.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${lexend.variable} ${playfair.variable} ${chakraPetch.variable} font-sans antialiased`}>
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-[hsl(var(--splash-blob-1))] via-splash-background to-[hsl(var(--splash-blob-2))] animate-breathing-bg">
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className="absolute inset-0">
                <defs>
                    <radialGradient id="blushGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                        <stop offset="0%" style={{ stopColor: 'hsl(var(--splash-blob-1))', stopOpacity: 0.7 }} />
                        <stop offset="100%" style={{ stopColor: 'hsl(var(--splash-blob-1))', stopOpacity: 0 }} />
                    </radialGradient>
                </defs>
                <path d="M 0,0 L 100,0 C 50,50 100,50 100,100 L 0,100 Z" fill="hsl(var(--splash-blob-1))" />
                <path d="M 0,100 C 50,50 0,50 0,0" fill="hsl(var(--splash-background))" />
                <path d="M 100,0 L 0,0 C 50,50 0,50 0,100 L 100,100 Z" fill="hsl(var(--splash-blob-2))" style={{ opacity: 0.5 }}/>
            </svg>
        </div>
        <div className="relative z-10">
          <AuthProvider>
            <LanguageProvider>
              {children}
              <Toaster />
            </LanguageProvider>
          </AuthProvider>
        </div>
      </body>
    </html>
  );
}
