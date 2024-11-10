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
  handleManualSave,
  handleUseItem,
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
          onManualSave={handleManualSave}
        />
        <Inventory onUseItem={handleUseItem} />
        <JournalViewer entries={state.journal || []} />
      </div>
    </div>
  );
}
