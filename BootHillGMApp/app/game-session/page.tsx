'use client';

import GameSessionContent from '../components/GameSessionContent';
// Removed incorrect import { NarrativeProvider } from '../context/NarrativeContext';

export default function GameSessionPage() {
  return (
    // Removed unnecessary NarrativeProvider wrapper
    <GameSessionContent />
  );
}
