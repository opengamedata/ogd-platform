import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'OGD Platform',
  description: 'Open Game Data Platform control plane.',
  icons: {
    icon: [
      { url: '/ogd/OGD-16.png', sizes: '16x17', type: 'image/png' },
      { url: '/ogd/OGD-32.png', sizes: '32x33', type: 'image/png' },
      { url: '/ogd/OGD-64.png', sizes: '64x65', type: 'image/png' },
    ],
    apple: [{ url: '/ogd/OGD-256.png', sizes: '256x257', type: 'image/png' }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
