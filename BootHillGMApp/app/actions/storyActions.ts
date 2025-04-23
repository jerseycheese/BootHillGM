/**
 * Story Action Creators
 * 
 * This file contains action creators for story progression related actions.
 */

import { ActionTypes } from '../types/actionTypes';
import { StoryProgressionPoint } from '../types/narrative.types';

/**
 * Action creator for adding a story point to the progression
 * @param point - Story progression point to add
 * @returns Story action object
 */
export const addStoryPoint = (point: StoryProgressionPoint) => ({
  type: ActionTypes.ADD_STORY_POINT,
  payload: point
});

/**
 * Action creator for updating the current story point
 * @param pointId - ID of the story point to set as current
 * @returns Story action object
 */
export const updateCurrentPoint = (pointId: string) => ({
  type: ActionTypes.UPDATE_CURRENT_POINT,
  payload: pointId
});

/**
 * Action creator for marking a branching point as taken
 * @param pointId - ID of the branching point
 * @returns Story action object
 */
export const markBranchingPointTaken = (pointId: string) => ({
  type: ActionTypes.MARK_BRANCHING_POINT_TAKEN,
  payload: pointId
});

/**
 * Action creator for resetting story progression
 * @returns Story action object
 */
export const resetStoryProgression = () => ({
  type: ActionTypes.RESET_STORY_PROGRESSION
});
