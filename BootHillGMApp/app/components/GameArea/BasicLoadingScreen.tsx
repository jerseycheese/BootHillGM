'use client';

import React from 'react';

type BasicLoadingScreenProps = {
  message?: string;
};

/**
 * A simplified loading screen component specifically for static generation
 * This component has no dependencies and should work reliably during build
 */
export function BasicLoadingScreen({ message = 'Loading...' }: BasicLoadingScreenProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-800 text-white p-4">
      <div className="text-2xl font-bold mb-4">Boot Hill GM</div>
      <div className="mb-4">{message}</div>
      <div className="w-64 h-2 bg-gray-600 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full animate-pulse"
          style={{ width: '50%' }}
        ></div>
      </div>
    </div>
  );
}
