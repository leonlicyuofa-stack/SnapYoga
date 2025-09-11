
import type {Metadata} from 'next';
import { Lexend, Caveat, Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/contexts/AuthContext'; 
import { LanguageProvider } from '@/contexts/LanguageContext';

const lexend = Lexend({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900']
});

const caveat = Caveat({
  variable: '--font-script',
  subsets: ['latin'],
});

const inter = Inter({
    variable: '--font-body',
    subsets: ['latin'],
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
      <body className={`${lexend.variable} ${caveat.variable} ${inter.variable} antialiased`}>
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
