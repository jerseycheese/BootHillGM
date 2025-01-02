import React from 'react';
import { Character } from '../../types/character';
import { CombatType, Weapon } from '../../types/combat';
import { InventoryItem } from '../../types/inventory';

/**
 * Extended inventory item interface specifically for weapons
 * Handles both direct weapon items and nested weapon objects
 */
interface WeaponInventoryItem extends InventoryItem {
  weapon?: {
    id: string;
    name: string;
    modifiers: Weapon['modifiers'];
  };
  modifiers?: Weapon['modifiers'];
}

import { useCampaignState } from '../CampaignStateManager';
import { getOpponentWeapon } from '../../utils/weaponUtils';
import { cleanCharacterName } from '../../utils/textCleaningUtils';
import { WeaponDisplay } from './WeaponDisplay';

interface CombatTypeSelectionProps {
  playerCharacter: Character;
  opponent: Character;
  onSelectType: (type: CombatType) => void;
}

/**
 * Displays combat type selection UI with available weapons for both player and opponent.
 * Shows brawling and weapon combat options based on availability.
 */
export const CombatTypeSelection: React.FC<CombatTypeSelectionProps> = ({
  opponent,
  onSelectType
}) => {
  const { state } = useCampaignState();
  // Brawling is always available as a combat option
  const canUseBrawling = true;
  // Check if either combatant has weapons available
  const hasWeaponInInventory = state.inventory?.some(item => item.category === 'weapon');
  const opponentHasWeapon = Boolean(opponent.weapon);
  const canUseWeapons = hasWeaponInInventory || opponentHasWeapon;

  return (
    <div className="combat-type-selection wireframe-section space-y-4">
      <h3 className="text-lg font-bold">Choose Combat Type</h3>
      
      <div className="grid grid-cols-1 gap-4">
        {canUseBrawling && (
          <button
            onClick={() => onSelectType('brawling')}
            className="wireframe-button p-4"
          >
            Brawling
            <span className="block text-sm mt-1">
              Engage in hand-to-hand combat
            </span>
          </button>
        )}
        
        <button
          onClick={() => onSelectType('weapon')}
          className="wireframe-button p-4"
          disabled={!canUseWeapons}
          aria-disabled={!canUseWeapons}
        >
          Weapon Combat
          <span className="block text-sm mt-1">
            {canUseWeapons 
              ? 'Fight using available weapons'
              : 'No weapons available for combat'}
          </span>
        </button>
      </div>

      {/* Display available weapons if any */}
      {canUseWeapons && (
        <div className="mt-4">
          <p className="font-medium mb-2">Available Weapons:</p>
          <div className="grid grid-cols-1 gap-2">
            {state.inventory
              .filter(item => {
                const weaponItem = item as WeaponInventoryItem;
                // Check if item is a weapon either through category or nested weapon object
                const isWeapon = (weaponItem.category === 'weapon' || weaponItem.weapon) && 
                       (weaponItem.modifiers || weaponItem.weapon?.modifiers) &&
                       !weaponItem.name.toLowerCase().includes('shells') &&
                       !weaponItem.name.toLowerCase().includes('cartridges');
                return isWeapon;
              })
              .map(item => {
                const weapon = item as WeaponInventoryItem;
                return (
                  <div key={weapon.id} className="p-2 border rounded">
                    <p className="font-medium">You: {weapon.name}</p>
                    <div className="text-sm space-y-1">
                      <WeaponDisplay weapon={weapon?.weapon || weapon} />
                      <p>Accuracy: {
                        (weapon?.weapon?.modifiers?.accuracy !== undefined || weapon?.modifiers?.accuracy !== undefined) ? 
                        (((weapon?.weapon?.modifiers?.accuracy ?? weapon?.modifiers?.accuracy) || 0) > 0 ? 
                          `+${weapon?.weapon?.modifiers?.accuracy ?? weapon?.modifiers?.accuracy}` : 
                          (weapon?.weapon?.modifiers?.accuracy ?? weapon?.modifiers?.accuracy)) : 'N/A'}</p>
                    </div>
                  </div>
                );
              })
            }
            <div className="p-2 border rounded">
              <p className="font-medium">{cleanCharacterName(opponent.name)}: {getOpponentWeapon(opponent).name}</p>
              <div className="text-sm space-y-1">
                <p>Damage: {getOpponentWeapon(opponent).modifiers.damage}</p>
                <p>Range: {getOpponentWeapon(opponent).modifiers.range} yards</p>
                <p>Accuracy: {getOpponentWeapon(opponent).modifiers.accuracy > 0 ? `+${getOpponentWeapon(opponent).modifiers.accuracy}` : getOpponentWeapon(opponent).modifiers.accuracy}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
