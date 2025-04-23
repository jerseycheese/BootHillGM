'use client';

import React from 'react';

// Using a properly defined interface with children prop instead of empty object
interface LayoutProps {
  children: React.ReactNode;
}

export default function GameSessionLayout({
  children,
}: LayoutProps) {
  return (
    <div id="game-session-layout">
      {children}
    </div>
  );
}
