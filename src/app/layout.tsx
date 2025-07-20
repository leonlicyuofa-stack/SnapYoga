
import type {Metadata} from 'next';
import { Inter, Shadows_Into_Light as ShadowsIntoLight } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/contexts/AuthContext'; 
import { LanguageProvider } from '@/contexts/LanguageContext';

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
});

const shadowsIntoLight = ShadowsIntoLight({
  variable: '--font-script',
  subsets: ['latin'],
  weight: '400',
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
      <body className={`${inter.variable} ${shadowsIntoLight.variable} antialiased`}>
        <AuthProvider>
          <LanguageProvider>
            {children}
            <Toaster />
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
