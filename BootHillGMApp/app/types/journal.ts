// Define the structure for a journal entry in the game
export interface JournalEntry {
  // Timestamp of when the entry was created (in milliseconds since epoch)
  timestamp: number;
  // The content of the journal entry
  content: string;
  // The narrative summary of the journal entry
  narrativeSummary?: string;
}
