import './globals.css';
import type { Metadata } from 'next';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Instagram AI Bot SaaS — Kurumsal Mesajlaşma ve Otomasyon Platformu',
  description: 'Meta resmi API uyumlu, profesyonel Instagram AI asistanı ve çok kanallı müşteri hizmetleri paneli.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className="antialiased selection:bg-indigo-500 selection:text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
