import { Weapon } from '../../types/combat';
import { InventoryItem } from '../../types/inventory';

interface WeaponInventoryItem extends InventoryItem {
  weapon?: {
    id: string;
    name: string;
    modifiers: Weapon['modifiers'];
  };
  modifiers?: Weapon['modifiers'];
}

interface WeaponDisplayProps {
  weapon: Weapon | WeaponInventoryItem;
  isPlayer?: boolean;
}

/**
 * WeaponDisplay Component
 * 
 * Renders a weapon's status with key attributes
 */
export const WeaponDisplay: React.FC<WeaponDisplayProps> = ({ weapon }) => (
  <div className="text-sm">
    <p className="font-medium">{weapon.name}</p>
    {weapon.modifiers && (
      <>
        <p>Damage: {weapon.modifiers.damage}</p>
        <p>Range: {weapon.modifiers.range}y</p>
        <p>Accuracy: {weapon.modifiers.accuracy > 0 ? `+${weapon.modifiers.accuracy}` : weapon.modifiers.accuracy}</p>
        {'ammunition' in weapon && 'maxAmmunition' in weapon && (
          <p>Ammo: {weapon.ammunition}/{weapon.maxAmmunition}</p>
        )}
      </>
    )}
  </div>
);
