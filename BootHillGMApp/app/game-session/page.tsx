'use client';

import GameSessionContent from '../components/GameSessionContent';
import { NarrativeProvider } from '../context/NarrativeContext';

export default function GameSessionPage() {
  return (
    <NarrativeProvider>
      <GameSessionContent />
    </NarrativeProvider>
  );
}
