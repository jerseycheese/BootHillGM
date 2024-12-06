import { Character } from '../types/character';
import { Weapon, WEAPON_STATS } from '../types/combat';

const isValidWeapon = (weapon: unknown): weapon is Weapon => {
  return typeof weapon === 'object' && weapon !== null &&
    typeof (weapon as Weapon).name === 'string' &&
    typeof (weapon as Weapon).id === 'string';
};

export const getDefaultWeapon = () => ({
  id: 'opponent-default-colt',
  name: 'Colt Revolver',
  modifiers: WEAPON_STATS['Colt Revolver'],
  ammunition: 6,
  maxAmmunition: 6
});

export const getOpponentWeapon = (opponent: Character) => {
  if (opponent.weapon && isValidWeapon(opponent.weapon)) {
    return {
      id: opponent.weapon.id || 'default-opponent-weapon',
      name: opponent.weapon.name,
      modifiers: WEAPON_STATS[opponent.weapon.name] || WEAPON_STATS['Colt Revolver'],
      ammunition: WEAPON_STATS[opponent.weapon.name]?.ammunition || 6,
      maxAmmunition: WEAPON_STATS[opponent.weapon.name]?.maxAmmunition || 6
    };
  }
  return getDefaultWeapon();
};
