'use client';

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import NavigationClient from './NavigationClient';

export default function Navigation() {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <nav id="bhgmNavigation" data-testid="navigation" className="bg-gray-800 p-4 bhgm-navigation">
      <ul className="flex space-x-4">
        <li>
          <Link
            href="/"
            className={`text-white hover:text-gray-300 ${
              pathname === '/' ? 'font-bold' : ''
            }`}
          >
            Home
          </Link>
        </li>
        <li>
          <Link
            href="/character-creation"
            className={`text-white hover:text-gray-300 ${
              pathname === '/character-creation' ? 'font-bold' : ''
            }`}
          >
            Create Character
          </Link>
        </li>
        <li>
          <Link
            href="/game-session"
            className={`text-white hover:text-gray-300 ${
              pathname === '/game-session' ? 'font-bold' : ''
            }`}
          >
            Game Session
          </Link>
        </li>
        <li>
          <Link
            href="/character-sheet"
            className={`text-white hover:text-gray-300 ${
              pathname === '/character-sheet' ? 'font-bold' : ''
            }`}
          >
            Character Sheet
          </Link>
        </li>
      </ul>
      {isClient && <NavigationClient />}
    </nav>
  );
}
