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
  if (!state.character) {
    return null;
  }

  // Extract player character from character state if needed
  const playerCharacter: Character | null = 
    'player' in state.character 
      ? state.character.player 
      : state.character as unknown as Character;
  
  // Extract journal entries from journal state if needed
  const journalEntries: JournalEntry[] = 
    state.journal && 'entries' in state.journal 
      ? state.journal.entries 
      : (state.journal as unknown as JournalEntry[] || []);

  if (!playerCharacter) {
    return null;
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
