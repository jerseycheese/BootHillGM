interface LoadingState {
  type: 'initialization' | 'ai-response' | 'combat' | 'inventory' | 'saving';
  message: string;
  isBlocking: boolean;
}

class LoadingStateManager {
  private static createLoadingMessage(type: LoadingState['type']): string {
    switch (type) {
      case 'initialization':
        return 'Loading game session...';
      case 'ai-response':
        return 'Processing your action...';
      case 'combat':
        return 'Resolving combat...';
      case 'inventory':
        return 'Processing item usage...';
      case 'saving':
        return 'Saving game state...';
      default:
        return 'Loading...';
    }
  }

  static getLoadingState(
    isInitializing: boolean,
    isAIProcessing: boolean,
    isCombatProcessing: boolean,
    isInventoryProcessing: boolean,
    isSaving: boolean
  ): LoadingState | null {
    if (isInitializing) {
      return {
        type: 'initialization',
        message: this.createLoadingMessage('initialization'),
        isBlocking: true
      };
    }
    
    if (isAIProcessing) {
      return {
        type: 'ai-response',
        message: this.createLoadingMessage('ai-response'),
        isBlocking: true
      };
    }
    
    if (isCombatProcessing) {
      return {
        type: 'combat',
        message: this.createLoadingMessage('combat'),
        isBlocking: true
      };
    }
    
    if (isInventoryProcessing) {
      return {
        type: 'inventory',
        message: this.createLoadingMessage('inventory'),
        isBlocking: false
      };
    }
    
    if (isSaving) {
      return {
        type: 'saving',
        message: this.createLoadingMessage('saving'),
        isBlocking: false
      };
    }
    
    return null;
  }
}

export default LoadingStateManager;
