import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { I18nProvider } from '@/context/I18nContext';

export const metadata: Metadata = {
  title: 'Linkora — Unified Lead Bank & AI Call-Center Platform',
  description: 'White-label multi-tenant lead management and integrated cloud dialer platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body className="bg-slate-50 min-h-screen">
        <I18nProvider>
          <AuthProvider>{children}</AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
