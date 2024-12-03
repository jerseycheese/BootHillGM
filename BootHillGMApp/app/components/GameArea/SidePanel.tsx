/**
 * SidePanel displays supplementary game information.
 * Shows character status, inventory, and journal entries.
 * Positioned on the right side of the game interface.
 */
import StatusDisplayManager from '../StatusDisplayManager';
import { Inventory } from '../Inventory';
import JournalViewer from '../JournalViewer';
import type { GameSessionProps } from './types';

export function SidePanel({
  state,
  handleUseItem,
  handleEquipWeapon,
}: GameSessionProps) {
  if (!state.character) {
    return null;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="space-y-4">
        <StatusDisplayManager
          character={state.character}
          location={state.location}
        />
        <Inventory 
          handleUseItem={handleUseItem}
          handleEquipWeapon={handleEquipWeapon}
        />
        <JournalViewer entries={state.journal || []} />
      </div>
    </div>
  );
}
