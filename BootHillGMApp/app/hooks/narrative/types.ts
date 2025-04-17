/**
 * Shared types for the Narrative Context hooks
 */
import { 
  NarrativeChoice,
  PlayerDecision,
  NarrativeDisplayMode,
  PlayerDecisionRecord,
  NarrativeState,
  NarrativeAction,
  StoryPoint
} from '../../types/narrative.types';

/**
 * Defines the return type of the narrative generation function
 */
export interface NarrativeResponse {
  narrative: string;
  acquiredItems: string[];
  removedItems: string[];
}

/**
 * Shape of the Narrative Context value
 */
export interface NarrativeContextValue {
  state: NarrativeState & {
    visitedPoints: string[];
    availableChoices: Array<string | NarrativeChoice>;
    displayMode: NarrativeDisplayMode;
    context: string;
    currentDecision?: PlayerDecision;
    narrativeHistory: string[];
    currentStoryPoint: StoryPoint | null;
  };
  dispatch: React.Dispatch<NarrativeAction>;
}

/**
 * Return type for the useNarrativeContext hook
 */
export interface UseNarrativeContextReturn {
  // Current decision state
  currentDecision: PlayerDecision | undefined;
  
  // Decision history
  decisionHistory: PlayerDecisionRecord[];
  
  // Decision functions
  presentPlayerDecision: (decision: PlayerDecision) => void;
  recordPlayerDecision: (decisionId: string, selectedOptionId: string) => Promise<void>;
  clearPlayerDecision: () => void;
  getDecisionHistory: (tags?: string[]) => PlayerDecisionRecord[];
  checkForDecisionTriggers: (narrativeText: string) => boolean;  // Changed from Promise<boolean> to boolean
  triggerAIDecision: (context?: string, importance?: string) => Promise<boolean>;
  ensureFreshState: () => Promise<NarrativeState>;
  
  // Decision state checks
  hasActiveDecision: boolean;
  isGeneratingNarrative: boolean;
}

/**
 * Shared debug interface for window.__debugNarrativeGeneration
 */
export interface NarrativeGenerationDebug {
  generateNarrativeResponse: (option: string, decisionPrompt: string) => Promise<NarrativeResponse>;
  addNarrativeHistory: (text: string) => void;
}
