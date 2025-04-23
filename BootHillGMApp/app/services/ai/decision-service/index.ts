/**
 * Decision Service Module 
 * 
 * This module exports the main DecisionService class for coordinating
 * AI-driven decision generation and processing, as well as the AIDecisionGenerator.
 */

import DecisionService from './decisionService';
import AIDecisionGenerator from './decisionGenerator';

// Export the main service as default
export default DecisionService;

// Named exports for other components
export { AIDecisionGenerator };
