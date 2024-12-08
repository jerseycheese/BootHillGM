import { Weapon } from '../types/combat';

export const WEAPONS: Record<string, Weapon> = {
  'Colt Peacemaker': {
    id: 'colt_peacemaker',
    name: 'Colt Peacemaker',
    modifiers: {
      accuracy: 70,
      reliability: 85,
      speed: 5,
      range: 20,
      damage: '10',
      ammunition: 6,
      maxAmmunition: 6
    }
  },
  'Derringer': {
    id: 'derringer',
    name: 'Derringer',
    modifiers: {
      accuracy: 50,
      reliability: 90,
      speed: 3,
      range: 10,
      damage: '6',
      ammunition: 2,
      maxAmmunition: 2
    }
  },
  'Cap & Ball Revolver': {
    id: 'cap_ball_revolver',
    name: 'Cap & Ball Revolver',
    modifiers: {
      accuracy: 60,
      reliability: 80,
      speed: 2,
      range: 15,
      damage: '8',
      ammunition: 6,
      maxAmmunition: 6
    }
  },
  'Single Action Revolver': {
    id: 'single_action_revolver',
    name: 'Single Action Revolver',
    modifiers: {
      accuracy: 70,
      reliability: 85,
      speed: 3,
      range: 20,
      damage: '10',
      ammunition: 6,
      maxAmmunition: 6
    }
  },
  'Double Action Revolver': {
    id: 'double_action_revolver',
    name: 'Double Action Revolver',
    modifiers: {
      accuracy: 65,
      reliability: 80,
      speed: 2,
      range: 20,
      damage: '8',
      ammunition: 6,
      maxAmmunition: 6
    }
  },
  'Fast Draw Revolver': {
    id: 'fast_draw_revolver',
    name: 'Fast Draw Revolver',
    modifiers: {
      accuracy: 75,
      reliability: 80,
      speed: 4,
      range: 15,
      damage: '10',
      ammunition: 6,
      maxAmmunition: 6
    }
  },
  'Long Barrel Revolver': {
    id: 'long_barrel_revolver',
    name: 'Long Barrel Revolver',
    modifiers: {
      accuracy: 60,
      reliability: 85,
      speed: 2,
      range: 25,
      damage: '10',
      ammunition: 6,
      maxAmmunition: 6
    }
  },
  'Scatter Gun': {
    id: 'scatter_gun',
    name: 'Scatter Gun',
    modifiers: {
      accuracy: 40,
      reliability: 70,
      speed: 1,
      range: 10,
      damage: '12',
      ammunition: 2,
      maxAmmunition: 2
    }
  },
  'Shotgun': {
    id: 'shotgun',
    name: 'Shotgun',
    modifiers: {
      accuracy: 50,
      reliability: 85,
      speed: 1,
      range: 15,
      damage: '12',
      ammunition: 2,
      maxAmmunition: 2
    }
  },
  'Civil War Rifle': {
    id: 'civil_war_rifle',
    name: 'Civil War Rifle',
    modifiers: {
      accuracy: 60,
      reliability: 80,
      speed: 1,
      range: 30,
      damage: '14',
      ammunition: 15,
      maxAmmunition: 15
    }
  },
  'Civil War Carbine': {
    id: 'civil_war_carbine',
    name: 'Civil War Carbine',
    modifiers: {
      accuracy: 55,
      reliability: 80,
      speed: 1,
      range: 25,
      damage: '10',
      ammunition: 15,
      maxAmmunition: 15
    }
  },
  'Buffalo Rifle': {
    id: 'buffalo_rifle',
    name: 'Buffalo Rifle',
    modifiers: {
      accuracy: 50,
      reliability: 75,
      speed: 0,
      range: 60,
      damage: '14',
      ammunition: 1,
      maxAmmunition: 1
    }
  },
  'Army Rifle': {
    id: 'army_rifle',
    name: 'Army Rifle',
    modifiers: {
      accuracy: 50,
      reliability: 75,
      speed: 0,
      range: 50,
      damage: '14',
      ammunition: 1,
      maxAmmunition: 1
    }
  },
  'Other Rifles': {
    id: 'other_rifles',
    name: 'Other Rifles',
    modifiers: {
      accuracy: 55,
      reliability: 80,
      speed: 1,
      range: 40,
      damage: '10',
      ammunition: 15,
      maxAmmunition: 15
    }
  },
  'Other Carbines': {
    id: 'other_carbines',
    name: 'Other Carbines',
    modifiers: {
      accuracy: 50,
      reliability: 80,
      speed: 1,
      range: 30,
      damage: '8',
      ammunition: 15,
      maxAmmunition: 15
    }
  },
  'Other Melee Weapon': {
    id: 'other_melee_weapon',
    name: 'Other Melee Weapon',
    modifiers: {
      accuracy: 80,
      reliability: 95,
      speed: 5,
      range: 1,
      damage: '6',
      ammunition: 1,
      maxAmmunition: 1
    }
  }
};
