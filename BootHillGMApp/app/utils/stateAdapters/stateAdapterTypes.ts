import { NarrativeContext } from '../../types/narrative/context.types';
import { Notification } from '../../types/state/uiState';

/**
 * Shared type definitions for state adapters
 */

// Define a type for the legacy state format
export interface LegacyState {
  [key: string]: unknown;
  player?: unknown;
  opponent?: unknown;
  inventory?: unknown[] | { items?: unknown[] };
  journal?: unknown[] | { entries?: unknown[] };
  entries?: unknown[];
  isCombatActive?: boolean;
  narrativeContext?: unknown;
  currentScene?: unknown;
  dialogues?: unknown[];
  activeTab?: string;
  isMenuOpen?: boolean;
  notifications?: unknown[];
  combatRounds?: number;
  currentTurn?: unknown;
  npcs?: unknown[];
  [key: number]: unknown;
}

// Extended NarrativeState for compatibility with legacy code
export interface ExtendedNarrativeState {
  context?: NarrativeContext;
  narrativeContext?: NarrativeContext;
  currentScene?: string;
  selectedChoice?: string;
  dialogues?: unknown[];
  currentStoryPoint?: string | null;
  visitedPoints?: string[];
  availableChoices?: unknown[];
  narrativeHistory?: unknown[];
  displayMode?: string;
  error?: unknown | null;
}

// Extended UIState for compatibility with legacy code
export interface ExtendedUIState {
  isLoading: boolean;
  modalOpen: string | null;
  notifications: Notification[];
  activeTab?: string;
  isMenuOpen?: boolean;
}