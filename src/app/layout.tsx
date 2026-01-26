
import type {Metadata} from 'next';
import { Lora, Shadows_Into_Light } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/contexts/AuthContext'; 
import { LanguageProvider } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

const lora = Lora({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-lora',
});

const shadowsIntoLight = Shadows_Into_Light({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-shadows-into-light',
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
      <body className={`${lora.variable} ${shadowsIntoLight.variable} font-serif antialiased`}>
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
