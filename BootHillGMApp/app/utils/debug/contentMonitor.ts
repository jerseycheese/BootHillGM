/**
 * Content Monitor Utility
 * 
 * This utility helps track and debug AI content generation issues
 * by providing a simple way to monitor content in localStorage
 * and determine whether it's AI-generated or hardcoded fallback.
 */

// Debug logging function
const debug = (...args: Parameters<typeof console.log>): void => {
  console.log('[DEBUG ContentMonitor]', ...args);
};

/**
 * Determines if content appears to be mock AI-generated instead of real AI-generated
 * @param content The text content to analyze
 * @returns True if the content appears to be mock AI-generated
 */
export function isMockContent(content: string): boolean {
  if (!content) return false;
  
  // Check for specific markers of mock content
  return (
    content.includes('[MOCK AI NARRATIVE]') ||
    content.includes('[MOCK SUMMARY]') ||
    content.includes('[MOCK]') ||
    content.includes('This narrative was generated for testing at')
  );
}

/**
 * Determines if content appears to be fallback content (non-AI generated)
 * @param content The text content to analyze
 * @returns True if the content appears to be fallback content
 */
export function isFallbackContent(content: string): boolean {
  if (!content) return false;
  
  // Check for specific markers of fallback content
  return (
    content.includes('GENERATED FALLBACK NARRATIVE') ||
    content.includes('[FALLBACK SUMMARY]') ||
    content.includes('find yourself at the beginning') ||
    (content.includes('Boot Hill') && content.length < 100) // Short content about Boot Hill
  );
}

/**
 * Determines if content appears to be real AI-generated content
 * @param content The text content to analyze
 * @returns True if the content appears to be real AI-generated
 */
export function isRealAIContent(content: string): boolean {
  if (!content) return false;
  
  // Real AI content should be longer and not contain mock/fallback markers
  return (
    content.length > 150 && 
    !isMockContent(content) && 
    !isFallbackContent(content)
  );
}

/**
 * Checks if content in localStorage appears to be hardcoded rather than AI-generated
 * @returns True if the content appears to be hardcoded
 */
export function checkHardcoded(): boolean {
  try {
    // Check narrative
    const narrativeContent = localStorage.getItem('narrative');
    if (narrativeContent) {
      const narrative = JSON.parse(narrativeContent);
      if (isMockContent(narrative) || isFallbackContent(narrative)) {
        return true;
      }
    }
    
    // Check journal entries
    const journalContent = localStorage.getItem('journal');
    if (journalContent) {
      const journal = JSON.parse(journalContent);
      if (Array.isArray(journal) && journal.length > 0) {
        if (isMockContent(journal[0].content) || isFallbackContent(journal[0].content)) {
          return true;
        }
      }
    }
    
    // Check suggested actions
    const suggestedActionsContent = localStorage.getItem('suggestedActions');
    if (suggestedActionsContent) {
      const actions = JSON.parse(suggestedActionsContent);
      if (Array.isArray(actions) && actions.length > 0) {
        const defaultActionTitles = [
          'Look around',
          'Visit the saloon',
          'Check your gear',
          'Explore town',
          'Explore the town'
        ];
        
        // Count how many actions have default titles
        const defaultActionCount = actions.filter(
          action => defaultActionTitles.includes(action.title)
        ).length;
        
        // Check if actions contain mock markers
        const hasMockActions = actions.some(
          action => action.description && isMockContent(action.description)
        );
        
        if (defaultActionCount >= 2 || hasMockActions) {
          return true;
        }
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error checking for hardcoded content:', error);
    return false;
  }
}

/**
 * Analyzes content in localStorage and reports whether it appears to be
 * AI-generated, mock, or hardcoded fallback content.
 */
export function analyzeContent(): void {
  // Only run in development mode
  if (process.env.NODE_ENV !== 'development') return;
  
  debug('Analyzing content in localStorage...');
  
  // Check for narrative content
  const narrativeContent = localStorage.getItem('narrative');
  if (narrativeContent) {
    try {
      const narrative = JSON.parse(narrativeContent);
      
      const isMock = isMockContent(narrative);
      const isFallback = isFallbackContent(narrative);
      const isReal = isRealAIContent(narrative);
      
      debug('Narrative content detected:', {
        length: narrative.length,
        preview: narrative.substring(0, 60) + '...',
        isMockContent: isMock,
        isFallbackContent: isFallback,
        isRealAIContent: isReal
      });
      
      if (isMock) {
        console.warn('⚠️ Narrative is MOCK AI-generated content! This should only appear in tests.');
      } else if (isFallback) {
        console.warn('⚠️ Narrative is FALLBACK content! AI generation likely failed.');
      } else if (isReal) {
        console.log('✅ Narrative appears to be REAL AI-generated content.');
      } else {
        debug('⚠️ Narrative content type is ambiguous.');
      }
    } catch (error) {
      debug('Error parsing narrative content:', error);
    }
  } else {
    debug('⚠️ No narrative content found in localStorage.');
  }
  
  // Check for journal entries
  const journalContent = localStorage.getItem('journal');
  if (journalContent) {
    try {
      const journal = JSON.parse(journalContent);
      if (Array.isArray(journal) && journal.length > 0) {
        const firstEntryContent = journal[0].content || '';
        
        const isMock = isMockContent(firstEntryContent);
        const isFallback = isFallbackContent(firstEntryContent);
        const isReal = isRealAIContent(firstEntryContent);
        
        debug('Journal entries detected:', {
          entryCount: journal.length,
          firstEntryType: journal[0].type,
          firstEntryTitle: journal[0].title,
          isMockContent: isMock,
          isFallbackContent: isFallback,
          isRealAIContent: isReal
        });
        
        if (isMock) {
          console.warn('⚠️ Journal entry is MOCK AI-generated content! This should only appear in tests.');
        } else if (isFallback) {
          console.warn('⚠️ Journal entry is FALLBACK content! AI generation likely failed.');
        } else if (isReal) {
          console.log('✅ Journal entry appears to be REAL AI-generated content.');
        }
      } else {
        debug('⚠️ Journal is empty or malformed.');
      }
    } catch (error) {
      debug('Error parsing journal content:', error);
    }
  } else {
    debug('⚠️ No journal content found in localStorage.');
  }
  
  // Check for suggested actions
  const suggestedActionsContent = localStorage.getItem('suggestedActions');
  if (suggestedActionsContent) {
    try {
      const actions = JSON.parse(suggestedActionsContent);
      if (Array.isArray(actions) && actions.length > 0) {
        const defaultActionTitles = [
          'Look around',
          'Visit the saloon',
          'Check your gear',
          'Explore town',
          'Explore the town'
        ];
        
        // Count how many actions have default titles
        const defaultActionCount = actions.filter(
          action => defaultActionTitles.includes(action.title)
        ).length;
        
        // Check if actions contain mock markers
        const hasMockActions = actions.some(
          action => action.description && isMockContent(action.description)
        );
        
        const isLikelyHardcoded = defaultActionCount >= 2 || hasMockActions; 
        
        debug('Suggested actions detected:', {
          actionCount: actions.length,
          defaultActionCount,
          hasMockActions,
          isLikelyHardcoded,
          titles: actions.map(a => a.title).join(', ')
        });
        
        if (hasMockActions) {
          console.warn('⚠️ Suggested actions contain MOCK content! This should only appear in tests.');
        } else if (isLikelyHardcoded) {
          console.warn('⚠️ Suggested actions appear to be hardcoded fallback content!');
        } else {
          console.log('✅ Suggested actions appear to be REAL AI-generated.');
        }
      } else {
        debug('⚠️ Suggested actions array is empty or malformed.');
      }
    } catch (error) {
      debug('Error parsing suggested actions content:', error);
    }
  } else {
    debug('⚠️ No suggested actions found in localStorage.');
  }
  
  // Check for reset flags
  const resetFlag = localStorage.getItem('_boothillgm_reset_flag');
  const forceGenFlag = localStorage.getItem('_boothillgm_force_generation');
  
  debug('Reset flags:', {
    resetFlag,
    forceGenFlag,
    resetFlagPresent: !!resetFlag,
    forceGenFlagPresent: !!forceGenFlag
  });
}

/**
 * Monitors content changes in localStorage.
 * Call this function to start monitoring.
 * @returns A function to stop monitoring
 */
export function monitorContent(): () => void {
  // Only run in development mode
  if (process.env.NODE_ENV !== 'development') {
    return () => {}; // Return a no-op function
  }
  
  debug('Starting content monitoring...');
  
  // Keep track of previous values
  let prevNarrative = localStorage.getItem('narrative');
  let prevJournal = localStorage.getItem('journal');
  let prevActions = localStorage.getItem('suggestedActions');
  
  // Run initial analysis
  analyzeContent();
  
  // Set up interval to check for changes
  const intervalId = setInterval(() => {
    const currentNarrative = localStorage.getItem('narrative');
    const currentJournal = localStorage.getItem('journal');
    const currentActions = localStorage.getItem('suggestedActions');
    
    // Check if any content has changed
    if (currentNarrative !== prevNarrative ||
        currentJournal !== prevJournal ||
        currentActions !== prevActions) {
      debug('Content change detected, analyzing...');
      
      // Update previous values
      prevNarrative = currentNarrative;
      prevJournal = currentJournal;
      prevActions = currentActions;
      
      // Analyze the new content
      analyzeContent();
    }
  }, 2000); // Check every 2 seconds
  
  // Return function to stop monitoring
  return () => {
    clearInterval(intervalId);
    debug('Content monitoring stopped.');
  };
}

/**
 * Attaches the monitor to the window for easy access in the console.
 * Call this once at app startup.
 */
export function attachContentMonitorToWindow(): void {
  // Only run in development mode
  if (process.env.NODE_ENV !== 'development') return;
  
  if (typeof window !== 'undefined') {
    // Add to window for easy access in browser console
    (window as Window & { contentMonitor?: Record<string, unknown> }).contentMonitor = {
      analyze: analyzeContent,
      startMonitoring: monitorContent,
      checkHardcoded,
      isMockContent,
      isFallbackContent,
      isRealAIContent,
      checkContentType: (text: string) => {
        if (isMockContent(text)) return 'MOCK';
        if (isFallbackContent(text)) return 'FALLBACK';
        if (isRealAIContent(text)) return 'REAL_AI';
        return 'UNKNOWN';
      }
    };
    
    debug('Content monitor attached to window. Access via window.contentMonitor');
  }
}