'use client';

import Link from 'next/link';

export default function HomeContent() {
  return (
    <main className="wireframe-container">
      <h1 className="wireframe-title">Welcome to BootHillGM</h1>
      <div className="wireframe-section">
        <p className="wireframe-text mb-4">
          Experience the Wild West with our AI-driven Boot Hill RPG Game Master.
        </p>
        <Link 
          href="/character-creation" 
          className="wireframe-button inline-block"
        >
          Create Character
        </Link>
      </div>
    </main>
  );
}
