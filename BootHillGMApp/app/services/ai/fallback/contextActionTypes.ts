/**
 * Context Action Types
 * 
 * Type definitions for the context action generator component.
 * 
 * @module services/ai/fallback
 */

import { ActionType as CampaignActionType } from '../../../types/campaign';
import { ResponseContextType } from './constants';

/**
 * Reuse the ActionType from campaign types to maintain consistency
 */
export type ActionType = CampaignActionType;

/**
 * Action template structure used for defining context-specific actions
 */
export interface ActionTemplate {
  title: string;
  description: string;
}

/**
 * Action templates mapped by action type
 */
export type ActionTemplateSet = Record<ActionType, ActionTemplate>;

/**
 * Context action templates mapped by context type
 * Uses mapped type for stricter type checking with enum values
 */
export type ContextActionTemplates = {
  [key in ResponseContextType]: ActionTemplateSet;
};
