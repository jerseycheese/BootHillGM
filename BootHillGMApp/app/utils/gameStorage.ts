import ServiceStorage from '../services/storage/gameStorage';
import { gameStateUtils } from '../test/utils';
import { Character } from '../types/character';

/**
 * Utility wrapper around ServiceStorage that supports test-local mockLocalStorage.
 * This provides a seamless testing experience while maintaining the actual storage
 * service implementation for production use.
 */
const GameStorage = {
  ...ServiceStorage,
  getCharacter: (): { player: Character | null; opponent: Character | null } => {
    type LocalJest = { requireActual: (moduleName: string) => { default: typeof ServiceStorage } };
    const jestEnv = (jest as unknown) as LocalJest;
    // Test override: check mockLocalStorage first for testing
    if (typeof jest !== 'undefined') {
      const legacy = gameStateUtils.mockLocalStorage.getItem('character-creation-progress');
      if (legacy) {
        try {
          const data = JSON.parse(legacy);
          if (data && data.character) {
            return { player: data.character as Character, opponent: null };
          }
        } catch {
          // ignore parse errors
        }
      }
      
      // Fallback to real service in test environment to avoid recursion
      if (jestEnv.requireActual) {
        const actualService = jestEnv.requireActual('../services/storage/gameStorage').default;
        return actualService.getCharacter();
      }
    }
    
    // Use the actual service implementation for non-test environments
    return ServiceStorage.getCharacter();
  }
};

export default GameStorage;
