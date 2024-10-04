import type { Metadata } from "next";
import { GameProviderWrapper } from './components/GameProviderWrapper';
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
          {children}
        </GameProviderWrapper>
      </body>
    </html>
  );
}