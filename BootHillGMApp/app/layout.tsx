import type { Metadata } from "next";
import { GameProviderWrapper } from './components/GameProviderWrapper';
// Removed import { CampaignStateProvider } from './components/CampaignStateManager';
import NarrativeOptimizationProvider from './components/NarrativeOptimizationProvider';
import Navigation from './components/Navigation';
import { Suspense } from 'react';
import "./globals.css";
import "./styles/wireframe.css";

export const metadata: Metadata = {
  title: "BootHillGM",
  description: "AI-driven Game Master for Boot Hill RPG",
};

// Add Crimson Text font
const crimsonText = {
  rel: 'stylesheet',
  href: 'https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap'
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href={crimsonText.href} />
      </head>
      <body>
        {/* Removed CampaignStateProvider wrapper */}
          <GameProviderWrapper>
            <NarrativeOptimizationProvider>
              <Suspense fallback={<p>Loading...</p>}>
                <Navigation />
              </Suspense>
              <main className="p-4">
                {children}
              </main>
            </NarrativeOptimizationProvider>
          </GameProviderWrapper>
        {/* Removed CampaignStateProvider wrapper */}
      </body>
    </html>
  );
}
