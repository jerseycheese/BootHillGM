/**
 * Lore Reducer Handlers - Main Index
 * 
 * This file re-exports handler functions for each lore action type from separate modules.
 */

export { 
  handleAddLoreFact,
  handleUpdateLoreFact
} from './factHandlers/loreFactHandlers';

export { 
  handleInvalidateLoreFact,
  handleValidateLoreFact
} from './factHandlers/loreValidityHandlers';

export { 
  handleAddRelatedFacts,
  handleRemoveRelatedFacts
} from './factHandlers/loreRelationHandlers';

export { 
  handleAddFactTags,
  handleRemoveFactTags
} from './factHandlers/loreTagHandlers';

export { 
  handleProcessLoreExtraction
} from './factHandlers/loreExtractionHandlers';