// BootHillGMApp/app/game-session/page.tsx

'use client';

import dynamic from 'next/dynamic';
import React from 'react';

const DynamicGameSession = dynamic(() => import('../components/GameSession'), {
  ssr: false,
  loading: () => <p>Loading game session...</p>
});

export default function GameSessionPage() {
  return <DynamicGameSession />;
}
