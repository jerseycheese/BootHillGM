'use client';

import { useEffect, useState } from 'react';
import CharacterSheetContent from '../components/CharacterSheetContent';

export default function ClientWrapper() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="wireframe-container">
        <div>Loading...</div>
      </div>
    );
  }

  return <CharacterSheetContent />;
}
