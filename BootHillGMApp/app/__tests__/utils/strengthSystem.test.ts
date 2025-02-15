import {
    getCharacterStrength,
    isCharacterDefeated,
    isKnockout,
    calculateUpdatedStrength,
    WOUND_EFFECTS,
  } from '../../utils/strengthSystem';
  import { Character } from '../../types/character';
  
  describe('strengthSystem', () => {
    describe('calculateCurrentStrength', () => {
      it('should return base strength if no wounds', () => {
        const character: Character = {
          isNPC: false,
          isPlayer: true,
          id: 'test-id',
          name: 'Test Character',
          inventory: [],
          isUnconscious: false,
          attributes: {
            strength: 15,
            baseStrength: 15,
            speed: 9,
            gunAccuracy: 8,
            throwingAccuracy: 8,
            bravery: 12,
            experience: 0,
          },
          wounds: [],
        };
        expect(getCharacterStrength(character)).toBe(15);
      });
  
      it('should subtract light wound penalty', () => {
        const character: Character = {
          isNPC: false,
          isPlayer: true,
          id: 'test-id',
          name: 'Test Character',
          inventory: [],
          isUnconscious: false,
          attributes: {
            strength: 15,
            baseStrength: 15,
            speed: 9,
            gunAccuracy: 8,
            throwingAccuracy: 8,
            bravery: 12,
            experience: 0,
          },
          wounds: [{ location: 'leftLeg', severity: 'light', damage: WOUND_EFFECTS.LIGHT, strengthReduction: WOUND_EFFECTS.LIGHT, turnReceived: 0 }],
        };
        expect(getCharacterStrength(character)).toBe(12);
      });
  
      it('should subtract serious wound penalty', () => {
        const character: Character = {
          isNPC: false,
          isPlayer: true,
          id: 'test-id',
          name: 'Test Character',
          inventory: [],
          isUnconscious: false,
          attributes: {
            strength: 15,
            baseStrength: 15,
            speed: 9,
            gunAccuracy: 8,
            throwingAccuracy: 8,
            bravery: 12,
            experience: 0,
          },
          wounds: [{ location: 'rightArm', severity: 'serious', damage: WOUND_EFFECTS.SERIOUS, strengthReduction: WOUND_EFFECTS.SERIOUS, turnReceived: 0 }],
        };
        expect(getCharacterStrength(character)).toBe(8);
      });
  
      it('should handle multiple wounds', () => {
        const character: Character = {
          isNPC: false,
          isPlayer: true,
          id: 'test-id',
          name: 'Test Character',
          inventory: [],
          isUnconscious: false,
          attributes: {
            strength: 15,
            baseStrength: 15,
            speed: 9,
            gunAccuracy: 8,
            throwingAccuracy: 8,
            bravery: 12,
            experience: 0,
          },
          wounds: [
            { location: 'leftLeg', severity: 'light', damage: WOUND_EFFECTS.LIGHT, strengthReduction: WOUND_EFFECTS.LIGHT, turnReceived: 0 },
            { location: 'rightArm', severity: 'serious', damage: WOUND_EFFECTS.SERIOUS, strengthReduction: WOUND_EFFECTS.SERIOUS, turnReceived: 0 },
          ],
        };
        expect(getCharacterStrength(character)).toBe(5);
      });
  
      it('should return 1 for mortal wound (not 0, due to location modifiers)', () => {
        const character: Character = {
          isNPC: false,
          isPlayer: true,
          id: 'test-id',
          name: 'Test Character',
          inventory: [],
          isUnconscious: false,
          attributes: {
            strength: 15,
            baseStrength: 15,
            speed: 9,
            gunAccuracy: 8,
            throwingAccuracy: 8,
            bravery: 12,
            experience: 0,
          },
          wounds: [{ location: 'head', severity: 'mortal', damage: WOUND_EFFECTS.MORTAL, strengthReduction: WOUND_EFFECTS.MORTAL, turnReceived: 0 }],
        };
        expect(getCharacterStrength(character)).toBe(1);
      });
  
      it('should allow strength below 1 when allowZero is true', () => {
        const character: Character = {
          isNPC: false,
          isPlayer: true,
          id: 'test-id',
          name: 'Test Character',
          inventory: [],
          isUnconscious: false,
          attributes: {
            strength: 5,
            baseStrength: 5,
            speed: 9,
            gunAccuracy: 8,
            throwingAccuracy: 8,
            bravery: 12,
            experience: 0,
          },
          wounds: [{ location: 'leftLeg', severity: 'serious', damage: WOUND_EFFECTS.SERIOUS, strengthReduction: WOUND_EFFECTS.SERIOUS, turnReceived: 0 }],
        };
        expect(getCharacterStrength(character, true)).toBe(-2);
      });
    });
  
    describe('isCharacterDefeated', () => {
      it('should return true if character has a mortal wound', () => {
        const character: Character = {
          isNPC: false,
          isPlayer: true,
          id: 'test-id',
          name: 'Test Character',
          inventory: [],
          isUnconscious: false,
          attributes: {
            strength: 15,
            baseStrength: 15,
            speed: 9,
            gunAccuracy: 8,
            throwingAccuracy: 8,
            bravery: 12,
            experience: 0,
          },
          wounds: [{ location: 'head', severity: 'mortal', damage: WOUND_EFFECTS.MORTAL, strengthReduction: WOUND_EFFECTS.MORTAL, turnReceived: 0 }],
        };
        expect(isCharacterDefeated(character)).toBe(true);
      });

      it('should return true if current strength is 0', () => {
        const character: Character = {
          isNPC: false,
          isPlayer: true,
          id: 'test-id',
          name: 'Test Character',
          inventory: [],
          isUnconscious: true,
          attributes: {
            strength: 15,
            baseStrength: 15,
            speed: 9,
            gunAccuracy: 8,
            throwingAccuracy: 8,
            bravery: 12,
            experience: 0,
          },
          wounds: [
            { location: 'leftLeg', severity: 'serious', damage: 7, strengthReduction: 7, turnReceived: 0},
            { location: 'rightLeg', severity: 'serious', damage: 7, strengthReduction: 7, turnReceived: 0},
            { location: 'leftArm', severity: 'light', damage: 3, strengthReduction: 3, turnReceived: 0}
          ],
        };
        expect(isCharacterDefeated(character)).toBe(true);
      });

      it('should return true if current strength is below 0', () => {
        const character: Character = {
          isNPC: false,
          isPlayer: true,
          id: 'test-id',
          name: 'Test Character',
          inventory: [],
          isUnconscious: true,
          attributes: {
            strength: 15,
            baseStrength: 15,
            speed: 9,
            gunAccuracy: 8,
            throwingAccuracy: 8,
            bravery: 12,
            experience: 0,
          },
          wounds: [
            { location: 'leftLeg', severity: 'serious', damage: 10, strengthReduction: 10, turnReceived: 0},
            { location: 'rightLeg', severity: 'serious', damage: 10, strengthReduction: 10, turnReceived: 0}
          ],
        };
        expect(isCharacterDefeated(character)).toBe(true);
      });

      it('should return false if character is alive and has strength', () => {
        const character: Character = {
          isNPC: false,
          isPlayer: true,
          id: 'test-id',
          name: 'Test Character',
          inventory: [],
          isUnconscious: false,
          attributes: {
            strength: 10,
            baseStrength: 15,
            speed: 9,
            gunAccuracy: 8,
            throwingAccuracy: 8,
            bravery: 12,
            experience: 0,
          },
          wounds: [],
        };
        expect(isCharacterDefeated(character)).toBe(false);
      });
    });
  
    describe('isKnockout', () => {
      it('should return true if damage reduces strength to 0', () => {
        expect(isKnockout(5, 5)).toBe(true);
      });
  
      it('should return false if damage is greater than current strength (defeat, not knockout)', () => {
        expect(isKnockout(5, 10)).toBe(false);
      });
  
      it('should return false if damage is less than current strength', () => {
        expect(isKnockout(5, 3)).toBe(false);
      });
    });
  
    describe('calculateUpdatedStrength', () => {
      it('should reduce strength by damage amount', () => {
        const character: Character = {
          isNPC: false,
          isPlayer: true,
          id: 'test-id',
          name: 'Test Character',
          inventory: [],
          isUnconscious: false,
          attributes: {
            strength: 10,
            baseStrength: 15,
            speed: 9,
            gunAccuracy: 8,
            throwingAccuracy: 8,
            bravery: 12,
            experience: 0,
          },
          wounds: [],
        };
        expect(calculateUpdatedStrength(character, 3).newStrength).toBe(7);
      });

      it('should not allow strength to go below 0', () => {
        const character: Character = {
          isNPC: false,
          isPlayer: true,
          id: 'test-id',
          name: 'Test Character',
          inventory: [],
          isUnconscious: false,
          attributes: {
            strength: 2,
            baseStrength: 15,
            speed: 9,
            gunAccuracy: 8,
            throwingAccuracy: 8,
            bravery: 12,
            experience: 0,
          },
          wounds: [],
        };
        expect(calculateUpdatedStrength(character, 5).newStrength).toBe(0);
      });

      it('should not allow strength to increase', () => {
        const character: Character = {
          isNPC: false,
          isPlayer: true,
          id: 'test-id',
          name: 'Test Character',
          inventory: [],
          isUnconscious: false,
          attributes: {
            strength: 10,
            baseStrength: 15,
            speed: 9,
            gunAccuracy: 8,
            throwingAccuracy: 8,
            bravery: 12,
            experience: 0,
          },
          wounds: [],
        };
        expect(calculateUpdatedStrength(character, -2).newStrength).toBe(10);
      });

      it('should correctly apply location modifiers', () => {
        const character: Character = {
          isNPC: false,
          isPlayer: true,
          id: 'test-id',
          name: 'Test Character',
          inventory: [],
          isUnconscious: false,
          attributes: {
            strength: 10,
            baseStrength: 15,
            speed: 9,
            gunAccuracy: 8,
            throwingAccuracy: 8,
            bravery: 12,
            experience: 0,
          },
          wounds: [],
        };
        // Head wound with 2 damage should reduce strength by 4
        expect(getCharacterStrength({...character, wounds: [{location: 'head', severity: 'light', damage: 2, strengthReduction: 2, turnReceived: 0}]})).toBe(6);
        // Abdomen wound with 5 damage should reduce strength by 6
        expect(getCharacterStrength({...character, wounds: [{location: 'abdomen', severity: 'light', damage: 5, strengthReduction: 5, turnReceived: 0}]})).toBe(4);
        // Chest wound with 3 damage should reduce strength by 4
        expect(getCharacterStrength({...character, wounds: [{location: 'chest', severity: 'light', damage: 3, strengthReduction: 3, turnReceived: 0}]})).toBe(6);
        // Left arm wound with 1 damage should reduce strength by 1
        expect(getCharacterStrength({...character, wounds: [{location: 'leftArm', severity: 'light', damage: 1, strengthReduction: 1, turnReceived: 0}]})).toBe(9);
        // Right leg wound with 4 damage should reduce strength by 4
        expect(getCharacterStrength({...character, wounds: [{location: 'rightLeg', severity: 'light', damage: 4, strengthReduction: 4, turnReceived: 0}]})).toBe(6);
    });
    });
  });
