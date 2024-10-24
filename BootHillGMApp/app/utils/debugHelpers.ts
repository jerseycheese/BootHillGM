import { GameState } from './gameEngine';
import { Character } from '../types/character';

export const debugState = (location: string, state: GameState, action?: string) => {
  const timestamp = new Date().toISOString();
  console.group(`[${timestamp}] ${location}${action ? ` - ${action}` : ''}`);
  console.log('Character:', {
    exists: !!state.character,
    name: state?.character?.name,
    health: state?.character?.health
  });
  console.log('Game State:', {
    location: state.location,
    narrativeLength: state?.narrative?.length,
    inventoryCount: state?.inventory?.length,
    savedTimestamp: state.savedTimestamp,
    isClient: state.isClient
  });
  console.groupEnd();
};

export const debugCharacterTransition = (message: string, character: Character | undefined, lastCreatedCharacter: Character | undefined) => {
  console.group(`[Character Transition] ${message}`);
  console.log('Current Character:', character?.name);
  console.log('Last Created Character:', lastCreatedCharacter?.name);
  console.log('Are Different:', character?.name !== lastCreatedCharacter?.name);
  console.groupEnd();
};
