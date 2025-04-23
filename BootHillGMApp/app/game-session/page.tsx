'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { BasicLoadingScreen } from '../components/GameArea/BasicLoadingScreen';

// Load GameSessionContent with SSR disabled
const GameSessionContent = dynamic(
  () => import('../components/GameSessionContent'),
  { ssr: false, loading: () => <BasicLoadingScreen message="Loading game session..." /> }
);

// Simple client-side only page
export default function GameSessionPage() {
  // Use state to track client-side rendering
  const [mounted, setMounted] = useState(false);
  
  // Set mounted state once component mounts on client
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Show a loading state during SSR or before mounting
  if (!mounted) {
    return <BasicLoadingScreen message="Preparing game session..." />;
  }
  
  // Render the actual content
  return <GameSessionContent />;
}
