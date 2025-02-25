export interface WeaponModifiers {
  accuracy: number;
  reliability: number;
  speed: number;
  range: number;
  damage: string;
  ammunition?: number;
  maxAmmunition?: number;
}

export interface Weapon {
  id: string;
  name: string;
  modifiers: WeaponModifiers;
  ammunition?: number;
  maxAmmunition?: number;
}
