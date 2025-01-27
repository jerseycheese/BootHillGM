# Strength System

## Overview

The Strength System in Boot Hill is a core mechanic that governs a character's physical power and resilience. It is primarily used in combat but can also influence other actions and interactions within the game.

## Key Concepts

### Base Strength

*   Represents a character's maximum physical strength.
*   Determined during character creation.
*   Ranges from 8 to 20 for player characters.
*   Used as the starting point for calculating current strength.

### Current Strength

*   Represents a character's current physical strength, which can be reduced by wounds.
*   Calculated by subtracting the total strength reduction from wounds from the base strength.
*   Cannot go below 1 unless the character is defeated.
*   Used in combat calculations, such as determining damage dealt in brawls.

### Wounds

*   Inflicted during combat or other dangerous situations.
*   Each wound has a location (e.g., "Left Leg", "Right Arm", "Body", "Head") and a severity ("Light", "Serious", "Mortal").
*   Each wound severity has an associated strength reduction value:
    *   Light: 2-5 (depending on location)
    *   Serious: 5-10 (depending on location)
    *   Mortal: 10-25 (depending on location)
*   Multiple wounds can be sustained, and their effects stack.

### Unconsciousness

*   A character becomes unconscious if their current strength is reduced to 0 or below.
*   An unconscious character is considered defeated in combat.

## Data Flow

1. **Character Creation:**
    *   `baseStrength` is determined either randomly or through AI generation.
    *   `strength` is initially set equal to `baseStrength`.

2. **Combat:**
    *   In brawling combat, damage dealt is calculated based on the attacker's current `strength` and a dice roll.
    *   In weapon combat, damage is determined by the weapon's damage rating, but a character's `strength` may still be relevant for certain actions or modifiers.
    *   When a character takes damage, a wound is inflicted.
    *   The `strengthReduction` of the wound is subtracted from the character's `baseStrength` to calculate their new `strength`.
    *   If `strength` reaches 0 or below, the character becomes unconscious.

3. **Status Display:**
    *   The `StatusDisplayManager` component calculates the `currentStrength` using the `calculateCurrentStrength` function from `strengthSystem.ts`.
    *   The `currentStrength` and `baseStrength` are passed to the `StrengthBar` component for visual representation.
    *   The `WoundDisplay` component displays the character's wounds, including their severity and `strengthReduction`.

4. **Game State Updates:**
    *   The `gameReducer` handles actions that modify a character's `strength`, `baseStrength`, and `wounds`.
    *   The `useBrawlingCombat` and `useWeaponCombat` hooks update the combat state, including `playerStrength` and `opponentStrength`, which are used during combat calculations.

## Redundancies and Potential Improvements

*   **Redundant Strength Values:** The `CombatState` interface includes `playerStrength`, `playerBaseStrength`, `opponentStrength`, and `opponentBaseStrength`. These values duplicate the `strength` and `baseStrength` attributes of the `Character` objects. This redundancy could be eliminated by directly referencing the `Character` objects within `CombatState`.
*   **Complex Calculations in Components:** The `CombatStatus` component performs calculations related to strength, such as determining the maximum strength for players and opponents. These calculations could be moved to utility functions or hooks to improve code organization and reusability.
*   **Inconsistent Use of Strength:** The code uses both `character.attributes.strength` and `combatState.playerStrength` in different places. This inconsistency could be resolved by consistently using `combatState` values during combat and updating the `Character` object after combat ends.

## Conclusion

The Strength System is a crucial part of Boot Hill's combat and character management. While functional, the current implementation has some redundancies and could benefit from refactoring to improve clarity and maintainability. By addressing these issues, the system can become more robust and easier to understand.

## Base Game Rules for Strength

### Character Creation

- Strength is one of the six primary attributes determined during character creation.
- Players roll percentile dice (d100) and consult the Strength Table to determine the character's initial `baseStrength` (8-20).
- `baseStrength` represents the character's maximum physical strength.
- `strength` is initially set equal to `baseStrength`.

### Combat

- **Strength Base (STB):** Calculated as `Strength ÷ 10` (round down).
- **Brawling:**
    - Base damage in brawling is determined by the attacker's STB.
    - Modifiers may apply based on the specific brawling action (e.g., +2 for Kick, +4 for Groin Strike).
    - Special moves like Throw and Pin are based on STB.
- **Weapon Combat:**
    - Strength may modify damage for certain weapons (e.g., melee weapons).
- **Wounds:**
    - Wounds reduce a character's current `strength`.
    - Each wound has a severity (Light, Serious, Mortal) with a corresponding strength reduction value.
    - Light: 2-5 (depending on location)
    - Serious: 5-10 (depending on location)
    - Mortal: 10-25 (depending on location)
    - If a character's `strength` is reduced to 0 or below, they are knocked unconscious.

### Other Uses

- **Carrying Capacity:** Strength determines how much weight a character can carry.
- **Physical Feats:** Strength is used for checks involving physical feats.

### Campaign Rules

- **Healing:**
    - Non-brawling wounds: Heal 1 `strength` point per week per wound.
    - Brawling damage: Heal 1 `strength` point per hour of rest.
    - Special penalties from wounds are removed when the wound is more than 50% healed.
- **Aging:**
    - Strength increases by 2% for each game year survived up to age 25.
    - Strength decreases by 2% each year after age 35.

## Differences from Base Game Rules

### Character Creation

- The base game rules specify that a character's `baseStrength` is determined by rolling percentile dice and consulting a table, resulting in a value between 8 and 20. The app's implementation currently allows for a wider range of values during character creation, and AI-generated characters may have values outside this range.

### Combat

- **Brawling Damage:** The base game rules specify that brawling damage is based on the attacker's Strength Base (STB), which is `strength ÷ 10` (round down). The app's implementation currently uses the character's current `strength` attribute directly for damage calculation, without dividing by 10.
- **Weapon Combat:** The base game rules specify that strength may modify damage for certain weapons (e.g., melee weapons). The app's implementation does not currently incorporate strength modifiers for weapon damage.
- **Wound Penalties:** The implementation uses fixed values for wound penalties (Light: 3, Serious: 7, Mortal: Infinity), while the base game rules specify a range based on the wound's location (Light: 2-5, Serious: 5-10, Mortal: 10-25).

### Healing

- The base game rules specify that non-brawling wounds heal 1 strength point per week, and brawling damage heals 1 point per hour of rest. The app's implementation currently does not have a time system, so healing is handled differently. The `StatusDisplayManager` component has a button to reset strength, but this is primarily for development and testing purposes.

### Other Differences

- **Carrying Capacity:** The base game rules specify that strength determines carrying capacity, but this is not currently implemented in the app.
- **Physical Feats:** The base game rules mention using strength for checks involving physical feats, but this is not currently implemented in the app.
- **Aging:** The base game rules specify that strength changes with age, but this is not currently implemented in the app.

These differences should be addressed in order to bring the app's strength system more in line with the base game rules.

## Suggested Refactors

To improve the strength system's implementation and bring it closer to the base game rules, the following refactors are suggested:

1. **Centralize Strength Calculations:** Consolidate all strength-related calculations, including current strength, wound effects, and healing, into `strengthSystem.ts`. This will improve code organization, reduce redundancy, and simplify future modifications.

2. **Refactor Combat State:** Modify the `CombatState` interface to directly reference `Character` objects instead of storing separate `playerStrength`, `playerBaseStrength`, `opponentStrength`, and `opponentBaseStrength` values. This eliminates redundancy and ensures consistency.

3. **Align Brawling Damage with Base Rules:** Update `brawlingEngine.ts` and `useBrawlingCombat.ts` to use Strength Base (STB), calculated as `strength ÷ 10` (round down), for brawling damage calculation, as per the base game rules.

4. **Implement Wound Location Modifiers:** Update the `Wound` type to include a `location` property and modify `strengthSystem.ts` to apply wound penalties based on location, using the ranges specified in the base game rules:

    ```
    - Light: 2-5 (depending on location)
    - Serious: 5-10 (depending on location)
    - Mortal: 10-25 (depending on location)
    ```

5. **Implement Campaign Rules:**

    -   Introduce a time system and integrate the healing rules from `campaign-rules.md`.
    -   Implement aging effects on strength as specified in the base game rules:
        -   Strength increases by 2% for each game year survived up to age 25.
        -   Strength decreases by 2% each year after age 35.

6. **Streamline Character Creation:**

    -   Enforce the 8-20 range for `baseStrength` during character creation, both for manual and AI-generated characters. This can be done by updating `useCharacterCreation.ts` and `characterService.ts`.

7. **Consider Other Uses of Strength:**

    -   Design and implement systems for carrying capacity and physical feat checks, using `strength` or STB as appropriate.

These refactors will result in a more robust, maintainable, and accurate implementation of the strength system, aligning it more closely with the original Boot Hill v2 rules while also simplifying the codebase.