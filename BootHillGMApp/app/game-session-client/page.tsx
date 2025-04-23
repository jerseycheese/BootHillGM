'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { BasicLoadingScreen } from '../components/GameArea/BasicLoadingScreen';

// Use dynamic import with ssr disabled to ensure the component only loads on the client
const GameSessionContent = dynamic(
  () => import('../components/GameSessionContent'),
  { 
    ssr: false,
    loading: () => <BasicLoadingScreen message="Loading game session..." />
  }
);

// Create a simple wrapper component
export default function GameSessionClientPage() {
  return <GameSessionContent />;
}
