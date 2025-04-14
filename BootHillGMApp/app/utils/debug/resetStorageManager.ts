/**
 * Reset Storage Manager
 * 
 * Handles localStorage cleanup and preparation during reset process
 */
import { logDiagnostic } from "../initializationDiagnostics";
import { Character } from "../../types/character";

/**
 * Handles localStorage cleanup and preparation during game reset
 * 
 * @param characterData Character data to preserve during reset
 */
export function handleResetStorage(characterData: Character | null): void {
  // Clear localStorage except for character data and needed keys
  Object.keys(localStorage).forEach(key => {
    if (key !== 'characterData' && 
        !key.startsWith('_boothillgm_') && 
        key !== 'diagnostic-history') {
      localStorage.removeItem(key);
    }
  });
  
  // Set reset flags for triggering AI generation - THIS MUST BE SET BEFORE AI GENERATION
  localStorage.setItem('_boothillgm_reset_flag', Date.now().toString());
  localStorage.setItem('_boothillgm_force_generation', 'true');
  localStorage.setItem('_boothillgm_skip_loading', 'true');
  
  // Save character data
  if (characterData) {
    localStorage.setItem('characterData', JSON.stringify(characterData));
  }
  
  // Save character data in formats expected by test
  if (characterData) {
    localStorage.setItem('character-creation-progress', JSON.stringify({ character: characterData }));
    localStorage.setItem('completed-character', JSON.stringify(characterData));
    
    logDiagnostic('RESET', 'Character data saved to localStorage for initialization', {
      hasAttributes: !!characterData.attributes,
      hasInventory: !!characterData.inventory
    });
  }
}