import type { Metadata } from "next";
import { GameProviderWrapper } from './components/GameProviderWrapper';
import Navigation from './components/Navigation';
import "./globals.css";
import "./styles/wireframe.css";

export const metadata: Metadata = {
  title: "BootHillGM",
  description: "AI-driven Game Master for Boot Hill RPG",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <GameProviderWrapper>
          <Navigation />
          <main className="p-4">
            {children}
          </main>
        </GameProviderWrapper>
      </body>
    </html>
  );
}