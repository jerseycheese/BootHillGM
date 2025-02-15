# Strength System

## Overview

The Strength System in Boot Hill is a core mechanic that governs a character's physical power and resilience. It is primarily used in combat but can also influence other actions and interactions within the game.

This system is implemented in the `strengthSystem.ts` module, which provides functions for calculating strength, determining defeat/knockout, and handling strength updates, including a detailed strength history.

## Key Concepts

### Base Strength

*   Represents a character's maximum physical strength.
*   Determined during character creation.
*   Ranges from 8 to 20 for player characters.
*   Used as the starting point for calculating current strength.

### Current Strength

*   Represents a character's current physical strength, which can be reduced by wounds.
*   Calculated by subtracting the total strength reduction from wounds (accounting for location modifiers) from the character's *current* strength, using the `getCharacterStrength` function.
*   Cannot go below 1 unless explicitly allowed (e.g., for defeat checks).
*   Used in combat calculations, such as determining damage dealt in brawls.

### Wounds

*   Inflicted during combat or other dangerous situations.
*   Each wound has a:
    *   `location` (e.g., "Left Leg", "Right Arm", "Body", "Head")
    *   `severity` ("Light", "Serious", "Mortal")
    *   `damage` value
    *   `strengthReduction` value (calculated based on damage and location modifiers)
*   Each wound severity has an associated *base* strength reduction value, defined in `WOUND_EFFECTS`:
    *   Light: 3
    *   Serious: 7
    *   Mortal: Infinity
*   Location modifiers can *increase* the strength reduction (negative modifiers in `LOCATION_MODIFIERS`).
*   Multiple wounds can be sustained, and their effects stack.

### Strength History

*   Tracks changes to a character's strength over time.
*   Stored in the `strengthHistory` property of the `Character` object.
*   Includes:
    *   `baseStrength`: The character's base strength.
    *   `changes`: An array of `StrengthChange` objects, each representing a change in strength.
*   `StrengthChange` objects include:
    *   `previousValue`: The strength value before the change.
    *   `newValue`: The strength value after the change.
    *   `reason`: The reason for the change (e.g., "damage", "healing").
    *   `timestamp`: The time the change occurred.

### Unconsciousness

*   A character becomes unconscious if their current strength is reduced to 0 or below, or if they receive a mortal wound.
*   An unconscious character is considered defeated in combat, as determined by the `isCharacterDefeated` function.

## Functions in `strengthSystem.ts`

The `strengthSystem.ts` module provides the following functions:

### `getCharacterStrength(character: Character, allowZero: boolean = false): number`

Calculates a character's current strength, accounting for wound penalties and location modifiers.

*   **Parameters:**
    *   `character`: The `Character` object whose strength is being calculated.
    *   `allowZero`: (Optional) A boolean indicating whether to allow strength to go below 1. Defaults to `false`.
*   **Returns:** The character's current strength as a number.

### `isCharacterDefeated(character: Character): boolean`

Determines if a character is defeated based on Boot Hill v2 rules. A character is defeated if they are unconscious, have a mortal wound, or their current strength is 0 or less.

*   **Parameters:**
    *   `character`: The `Character` object being checked for defeat.
*   **Returns:** `true` if the character is defeated, `false` otherwise.

### `isKnockout(currentStrength: number, damage: number): boolean`

Determines if an attack will result in a knockout. A knockout occurs when remaining strength would be reduced to 0.

*   **Parameters:**
    *   `currentStrength`: The character's current strength.
    *   `damage`: The amount of damage taken.
*   **Returns:** `true` if the attack results in a knockout, `false` otherwise.

### `calculateUpdatedStrength(character: Character, damage: number): { newStrength: number, updatedHistory: StrengthHistory }`

Calculates the new strength value after taking damage, and logs the change to the character's strength history.

*   **Parameters:**
    *   `character`: The `Character` object taking damage.
    *   `damage`: The amount of damage taken.
*   **Returns:** An object containing the new strength (`newStrength`) and the updated strength history (`updatedHistory`).

### `validateStrengthChange(currentStrength: number, newStrength: number, baseStrength: number): boolean`

Validates a proposed strength change, ensuring that the new strength does not exceed the base strength or current strength (unless it's a healing scenario, which is not yet implemented).

*    **Parameters:**
     *   `currentStrength`: The character's current strength.
     *   `newStrength`: The proposed new strength.
     *   `baseStrength`: The character's base strength.
*   **Returns:** `true` if the change is valid, `false` otherwise.

### `validateStrengthValue(strength: number, character: Character): boolean`

Validates that a given strength value matches the calculated strength for a character, allowing for minor floating-point differences.

*   **Parameters:**
    *   `strength`: The strength value to validate.
    *   `character`: The `Character` object to check against.
*   **Returns:** `true` if the strength value is valid, `false` otherwise.

## Data Flow

1.  **Character Creation:**
    *   `baseStrength` is determined either randomly or through AI generation.
    *   `strength` is initially set equal to `baseStrength`.
    *   `strengthHistory` is initialized, with the first entry reflecting the initial strength.

2.  **Combat:**
    *   In brawling combat, damage dealt is calculated based on the attacker's current `strength` and a dice roll.
    *   In weapon combat, damage is determined by the weapon's damage rating.
    *   When a character takes damage, a wound is inflicted.
    *   The `calculateUpdatedStrength` function is called to:
        *   Calculate the new strength value (accounting for damage and location modifiers).
        *   Update the character's `strengthHistory` with a new `StrengthChange` entry.
    *   If `strength` reaches 0 or below, the character becomes unconscious, as determined by `isCharacterDefeated`.

3.  **Status Display:**
    *   The `StatusDisplayManager` component calculates the `currentStrength` using the `getCharacterStrength` function from `strengthSystem.ts`.
    *   The `currentStrength` and `baseStrength` are passed to the `StatusDisplay` component for visual representation.
    *   The `StatusDisplay` component also displays the character's `strengthHistory` in reverse chronological order.

4.  **Game State Updates:**
    *   The `gameReducer` handles actions that modify a character's `strength`, `baseStrength`, `wounds`, and `strengthHistory`.
    *   The `useBrawlingCombat` and `useWeaponCombat` hooks update the combat state, using `calculateUpdatedStrength` to update character strength and history.

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
- **Wound Penalties:** The implementation uses `damage` and `strengthReduction` on wounds. The `strengthReduction` is calculated based on damage and location modifiers.

### Healing

- The base game rules specify that non-brawling wounds heal 1 strength point per week, and brawling damage heals 1 point per hour of rest. The app's implementation currently does not have a time system, so healing is handled differently.

### Other Differences

- **Carrying Capacity:** The base game rules specify that strength determines carrying capacity, but this is not currently implemented in the app.
- **Physical Feats:** The base game rules mention using strength for checks involving physical feats, but this is not currently implemented in the app.
- **Aging:** The base game rules specify that strength changes with age, but this is not currently implemented in the app.

These differences should be addressed in order to bring the app's strength system more in line with the base game rules.

## Suggested Refactors

To further improve the strength system's implementation and bring it closer to the base game rules, the following refactors are suggested:

1.  **Refactor Combat State:** Modify the `CombatState` interface to directly reference `Character` objects instead of storing separate strength values. **Pending.**
2.  **Align Brawling Damage with Base Rules:** Update `brawlingEngine.ts` and `useBrawlingCombat.ts` to use Strength Base (STB) for brawling damage. **Pending.**
3.  **Implement Campaign Rules:** Implement time system, healing rules, and aging effects on strength. **Pending.**
4.  **Streamline Character Creation:** Enforce the 8-20 range for `baseStrength` during character creation. **Pending.**
5.  **Consider Other Uses of Strength:** Design and implement systems for carrying capacity and physical feat checks. **Pending.**

These refactors will result in a more robust, maintainable, and accurate implementation of the strength system, aligning it more closely with the original Boot Hill v2 rules while also simplifying the codebase.
