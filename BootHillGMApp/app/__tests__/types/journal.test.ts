import { NarrativeJournalEntry } from '../../types/journal';
import { CampaignState } from '../../types/campaign';

describe('Journal Types', () => {
  it('should have the correct structure for JournalEntry', () => {
    const entry: NarrativeJournalEntry = {
      timestamp: Date.now(),
      content: 'Test journal entry',
      type: 'narrative'
    };

    expect(entry).toHaveProperty('timestamp');
    expect(typeof entry.timestamp).toBe('number');
    expect(entry).toHaveProperty('content');
    expect(typeof entry.content).toBe('string');
    expect(entry.type).toBe('narrative');
  });

  it('should include journal in CampaignState', () => {
    const campaignState: Partial<CampaignState> = {
      journal: []
    };

    expect(campaignState).toHaveProperty('journal');
    expect(Array.isArray(campaignState.journal)).toBe(true);
  });
});