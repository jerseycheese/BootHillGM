/**
 * SidePanel displays supplementary game information.
 * Shows character status, inventory, and journal entries.
 * Positioned on the right side of the game interface.
 */
import StatusDisplayManager from '../StatusDisplayManager';
import { Inventory } from '../Inventory';
import JournalViewer from '../JournalViewer';
import type { GameSessionProps } from './types';
import { Character } from '../../types/character';
import { JournalEntry } from '../../types/journal';

export function SidePanel({
  state,
  handleEquipWeapon,
}: GameSessionProps) {
  if (!state || !state.character) {
    return (
      <div className="h-full flex flex-col">
        <div className="space-y-4">
          <div className="p-4 border rounded">
            <p>Loading character data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Extract player character from character state if needed
  const playerCharacter: Character | null = 
    state.character && typeof state.character === 'object' && 'player' in state.character 
      ? state.character.player 
      : state.character as unknown as Character;
  
  // Extract journal entries from journal state if needed
  const journalEntries: JournalEntry[] = 
    state.journal && typeof state.journal === 'object' && 'entries' in state.journal 
      ? state.journal.entries 
      : (Array.isArray(state.journal) ? state.journal : []);

  if (!playerCharacter) {
    return (
      <div className="h-full flex flex-col">
        <div className="space-y-4">
          <div className="p-4 border rounded">
            <p>Character data not available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="space-y-4">
        <StatusDisplayManager
          character={playerCharacter}
          location={state.location}
        />
        <Inventory
          handleEquipWeapon={handleEquipWeapon}
        />
        <JournalViewer entries={journalEntries} />
      </div>
    </div>
  );
}
