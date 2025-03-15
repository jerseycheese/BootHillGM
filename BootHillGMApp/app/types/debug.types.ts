// types/debug.types.ts
import { GameState } from "../types/gameState";
import { GameEngineAction } from "../types/gameActions";
import { DecisionImportance } from "../types/narrative.types";
import { LocationType } from "../services/locationService";
import { NarrativeContextType } from "../context/NarrativeContext";

/**
 * Props for the DevToolsPanel component
 */
export interface DevToolsPanelProps {
  gameState: GameState;
  dispatch: React.Dispatch<GameEngineAction>;
  id?: string;
  "data-testid"?: string;
}

/**
 * Props for the GameControlSection component
 */
export interface GameControlSectionProps {
  dispatch: React.Dispatch<GameEngineAction>;
  loading: string | null;
  setLoading: React.Dispatch<React.SetStateAction<string | null>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
}

/**
 * Props for the DecisionTestingSection component
 */
export interface DecisionTestingSectionProps {
  narrativeContext: NarrativeContextType;
  loading: string | null;
  setLoading: React.Dispatch<React.SetStateAction<string | null>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  forceRender: () => void;
  hasActiveDecision: boolean;
  handleClearDecision: () => void;
}

/**
 * Props for the ContextualDecisionSection component
 */
export interface ContextualDecisionSectionProps {
  selectedLocationType: LocationType;
  setSelectedLocationType: React.Dispatch<React.SetStateAction<LocationType>>;
  loading: string | null;
  hasActiveDecision: boolean;
  handleContextualDecision: (locationType?: LocationType) => void;
}

/**
 * Props for the NarrativeDebugPanel component
 */
export interface NarrativeDebugPanelProps {
  narrativeContext: NarrativeContextType;
  renderCount: number;
  showDecisionHistory: boolean;
  decisionHistory: any[]; // Use the specific type from your narrative context
}

/**
 * Props for the GameStateDisplay component
 */
export interface GameStateDisplayProps {
  gameState: GameState;
}

/**
 * Props for ErrorBoundary component
 */
export interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export interface ErrorBoundaryState {
  hasError: boolean;
}