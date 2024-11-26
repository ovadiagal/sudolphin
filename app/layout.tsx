import { EnvVarWarning } from '@/components/env-var-warning';
import HeaderAuth from '@/components/header-auth';
import { hasEnvVars } from '@/utils/supabase/check-env-vars';
import { GeistSans } from 'geist/font/sans';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import Link from 'next/link';
import './globals.css';

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000';

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: 'Sudolphin',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={GeistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster />
          <main className="min-h-screen flex flex-col items-center">
            <div className="flex-1 w-full flex flex-col gap-20 items-center">
              <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
                <div className="w-ful w-4/5 flex justify-between items-center p-3 px-5 text-sm">
                  <div className="flex gap-5 items-center font-semibold">
                    <Link href={'/'} className="text-lg">
                      Sudolphin
                    </Link>
                  </div>
                  {!hasEnvVars ? <EnvVarWarning /> : <HeaderAuth />}
                </div>
              </nav>
              <div className="flex flex-col gap-20 w-4/5 p-5">{children}</div>
            </div>
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
