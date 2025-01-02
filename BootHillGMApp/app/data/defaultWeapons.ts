export const DefaultWeapons = {
  coltRevolver: {
    id: 'colt-revolver',
    name: 'Colt Single Action Revolver',
    modifiers: {
      accuracy: 2,
      range: 20,
      reliability: 95,
      damage: '2d10',
      speed: 8,
      ammunition: 6,
      maxAmmunition: 6
    },
    ammunition: 6,
    maxAmmunition: 6
  }
};

export type DefaultWeapon = typeof DefaultWeapons.coltRevolver;
