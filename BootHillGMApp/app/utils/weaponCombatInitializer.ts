import { Character } from '../types/character';
import { WeaponCombatState, WEAPON_STATS } from '../types/combat';
import { InventoryItem } from '../types/inventory';
import { getOpponentWeapon } from './weaponUtils';

export const initializeWeaponCombatState = (
  playerCharacter: Character,
  opponent: Character,
  initialState?: WeaponCombatState
): WeaponCombatState => {
  if (initialState) return initialState;

  // Find first available weapon in inventory
  const availableWeapon = playerCharacter.inventory?.find((item: InventoryItem) => 
    item.category === 'weapon' && item.quantity > 0
  ) || {
    id: 'default-colt',
    name: 'Colt Revolver',
    quantity: 1,
    category: 'weapon' as const,
    description: 'Standard issue Colt revolver'
  };

  // Create weapon object
  const playerWeapon = {
    id: availableWeapon.id,
    name: availableWeapon.name,
    modifiers: WEAPON_STATS[availableWeapon.name] || WEAPON_STATS['Colt Revolver'],
    ammunition: 6,
    maxAmmunition: 6
  };

  // Create opponent weapon
  const opponentWeapon = getOpponentWeapon(opponent);

  return {
    round: 1,
    playerWeapon,
    opponentWeapon,
    currentRange: 15,
    roundLog: [],
    lastAction: undefined
  };
};
