import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"; // Import Toaster

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'AttendEase', // Update title
  description: 'Effortless student attendance management system.', // Update description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Removed data-dme-* attributes to prevent hydration mismatch
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}>
        {children}
        <Toaster /> {/* Add Toaster component */}
      </body>
    </html>
  );
}
