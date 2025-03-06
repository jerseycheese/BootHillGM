---
title: Reset Game Feature
aliases: [Reset Game, Game Reset]
tags: [feature, completed, reset]
created: 2025-03-06
updated: 2025-03-06
---

# Reset Game Feature

This feature allows users to reset the game state to its initial values. This includes:

- Resetting character strength to its base value.
- Clearing all character wounds.
- Resetting the character's unconscious state to false.
- Clearing the character's strength history.
- Resetting other game state elements (e.g., `isCombatActive`, `inventory`, `location`, `npcs`, `quests`, `journal`, `gameProgress`).
- Fetching an initial narrative from the AI to provide a starting point for the new game session.

The feature is implemented in the `cleanupState` function within the `CampaignStateManager` component (`BootHillGMApp/app/components/CampaignStateManager.tsx`). It is triggered by the "Reset Game" button in the `DevToolsPanel`.