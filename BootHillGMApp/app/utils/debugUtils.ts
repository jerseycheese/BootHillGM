interface TextCleaningDebugEntry {
  originalText: string;
  cleanedText: string;
  source: string;
  cleaningFunction: string;
  timestamp: number;
}

class DebugTracker {
  private static instance: DebugTracker;
  private entries: TextCleaningDebugEntry[] = [];

  private constructor() {}

  static getInstance(): DebugTracker {
    if (!DebugTracker.instance) {
      DebugTracker.instance = new DebugTracker();
    }
    return DebugTracker.instance;
  }

  addEntry(entry: TextCleaningDebugEntry) {
    this.entries.push(entry);
  }

  getEntries(): TextCleaningDebugEntry[] {
    return [...this.entries];
  }

  clear() {
    this.entries = [];
  }
}

export const debugTracker = DebugTracker.getInstance();

export const trackTextCleaning = (
  originalText: string,
  cleanedText: string,
  source: string,
  cleaningFunction: string
) => {
  debugTracker.addEntry({
    originalText,
    cleanedText,
    source,
    cleaningFunction,
    timestamp: Date.now()
  });
};
