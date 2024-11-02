'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { useCampaignState } from './CampaignStateManager';
import { useGame } from '../utils/gameEngine';
import { debugStorage } from '../utils/debugHelpers';

export default function Navigation() {
  const pathname = usePathname();
  const { loadGame } = useCampaignState();
  const { state, dispatch } = useGame();

  useEffect(() => {
    // Debug current state
    console.log('Navigation - Current game state:', state);
    debugStorage();

    // Load game state if no character is present
    if (!state.character) {
      const loadedState = loadGame();
      if (loadedState) {
        console.log('Navigation - Loaded state:', loadedState);
        dispatch({ type: 'SET_STATE', payload: loadedState });
      }
    }
  }, [state.character, loadGame, state, dispatch]);

  return (
    <nav className="bg-gray-800 p-4">
      <ul className="flex space-x-4">
        <li>
          <Link 
            href="/" 
            className={`text-white hover:text-gray-300 ${pathname === '/' ? 'font-bold' : ''}`}
          >
            Home
          </Link>
        </li>
        <li>
          <Link 
            href="/character-creation" 
            className={`text-white hover:text-gray-300 ${pathname === '/character-creation' ? 'font-bold' : ''}`}
          >
            Create Character
          </Link>
        </li>
        <li>
          <Link 
            href="/game-session" 
            className={`text-white hover:text-gray-300 ${pathname === '/game-session' ? 'font-bold' : ''}`}
          >
            Game Session
          </Link>
        </li>
        <li>
          <Link 
            href="/character-sheet" 
            className={`text-white hover:text-gray-300 ${pathname === '/character-sheet' ? 'font-bold' : ''}`}
          >
            Character Sheet
          </Link>
        </li>
      </ul>
    </nav>
  );
}
