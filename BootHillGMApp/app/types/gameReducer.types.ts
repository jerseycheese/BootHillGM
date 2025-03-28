import { GameEngineAction } from './gameActions';
import { StoryProgressionData } from './narrative.types';

/**
 * Action type for setting narrative state
 */
export type SetNarrativeAction = {
  type: 'SET_NARRATIVE';
  payload:
    | {
        text: string;
        storyProgression?: StoryProgressionData;
      }
    | string;
};

/**
 * Union type for all actions handled by the game reducer
 */
export type GameReducerAction = GameEngineAction | SetNarrativeAction;
