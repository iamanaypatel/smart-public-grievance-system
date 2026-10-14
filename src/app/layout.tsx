import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { ThemeProvider } from '@/context/ThemeContext';
import React, { Suspense } from 'react';
import { DemoBanner } from '@/components/DemoBanner';
import { Navbar } from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Smart Public Grievance System (SPGS) | Government of India Civic Redressal',
  description:
    'Digital civic grievance redressal portal for Indian citizens to report municipal issues, track status in real-time, communicate with government departments, and review resolution performance.',
  keywords: [
    'Public Grievance System',
    'SPGS India',
    'Civic Redressal Portal',
    'Municipal Complaints',
    'Citizen Redressal',
    'Digital India',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('spgs_theme');
                  if (saved === 'dark') {
                    document.documentElement.classList.add('dark');
                    document.documentElement.classList.remove('light');
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.classList.add('light');
                  }
                } catch (e) {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.classList.add('light');
                }
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#F4F7FB] dark:bg-[#0B111E] text-[#1C2B3A] dark:text-[#F1F5F9] antialiased">
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <DemoBanner />
              <Suspense fallback={<div className="h-16" />}>
                <Navbar />
              </Suspense>
              <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6">
                {children}
              </main>
              {/* Civic Footer */}
              <footer className="mt-auto border-t border-[#D9E2EF] dark:border-[#23314D] bg-white dark:bg-[#131B2E] py-8 text-xs text-[#5B6573] dark:text-slate-400">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex flex-col gap-1 text-center md:text-left">
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      Smart Public Grievance System (SPGS) • College Innovation Competition Prototype
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Built with Next.js, TypeScript, Tailwind CSS, PostgreSQL schema & OpenStreetMap. Demonstration prototype; not officially affiliated with any government agency.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
                    <a href="/transparency" className="hover:text-blue-600 dark:hover:text-blue-400">
                      Public Statistics
                    </a>
                    <a href="/faq" className="hover:text-blue-600 dark:hover:text-blue-400">
                      Citizen Charter & FAQ
                    </a>
                    <a href="/privacy" className="hover:text-blue-600 dark:hover:text-blue-400">
                      Privacy Policy
                    </a>
                    <a href="/terms" className="hover:text-blue-600 dark:hover:text-blue-400">
                      Terms of Use
                    </a>
                    <a href="/demo" className="text-amber-600 dark:text-amber-400 font-bold hover:underline">
                      ★ Demo Walkthrough
                    </a>
                  </div>
                </div>
              </footer>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
