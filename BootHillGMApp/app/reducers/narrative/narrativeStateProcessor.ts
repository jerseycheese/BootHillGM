import { ExtendedGameState } from '../../types/extendedState';
import { StoryProgressionPoint } from '../../types/narrative.types';
import { SetNarrativeAction } from '../../types/gameReducer.types';

/**
 * Processes SET_NARRATIVE action
 */
export function processSetNarrative(state: ExtendedGameState, action: SetNarrativeAction): ExtendedGameState {
  // Extract currentPoint logic
  let currentPoint: string | null;
  const payload = action.payload;
  const storyProgressionData = typeof payload !== 'string' ? payload.storyProgression : undefined;
  
  if (storyProgressionData?.currentPoint !== undefined) {
    currentPoint = storyProgressionData.currentPoint ?? null;
  } else {
    currentPoint = state.narrative.storyProgression?.currentPoint ?? null;
  }

  let updatedProgressionPoints = state.narrative.storyProgression?.progressionPoints ?? { /* Intentionally empty */ };

  if (typeof payload !== 'string' && payload.storyProgression) {
    const newPointId = `story_point_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    if (storyProgressionData && storyProgressionData.currentPoint === undefined) {
      currentPoint = newPointId;
    }

    const newStoryPoint: StoryProgressionPoint = {
      id: newPointId,
      title: storyProgressionData?.title ?? '',
      description: storyProgressionData?.description ?? '',
      significance: storyProgressionData?.significance ?? 'minor',
      characters: storyProgressionData?.characters ?? [],
      timestamp: Date.now(),
      aiGenerated: true, // Assuming AI-generated for now, can be adjusted
      location: state.location ?? undefined,
      tags: storyProgressionData?.tags ?? []
    };
    updatedProgressionPoints = {
      ...updatedProgressionPoints,
      [newPointId]: newStoryPoint,
    };
  }
      
  return {
    ...state,
    narrative: {
      ...state.narrative,
      narrativeHistory: [...(state.narrative.narrativeHistory || []),
        typeof payload === 'string' ? payload : payload.text
      ],
      storyProgression: {
        ...state.narrative.storyProgression,
        currentPoint,
        progressionPoints: updatedProgressionPoints,
        mainStorylinePoints: state.narrative.storyProgression?.mainStorylinePoints ?? [],
        branchingPoints: state.narrative.storyProgression?.branchingPoints ?? { /* Intentionally empty */ },
        lastUpdated: Date.now()
      }
    }
  };
}
