/**
 * Mock for AIService
 * Creates a controlled mock that can be referenced externally
 */

// Create an exportable mock object
export const mockGenerateNarrativeSummary = jest.fn().mockResolvedValue('Mocked summary');

// Mock the AI service class
export class MockAIService {
  generateNarrativeSummary = mockGenerateNarrativeSummary;
  generateGameContent = jest.fn();
  isRequestInProgress = jest.fn().mockReturnValue(false);
  getLastRequestTimestamp = jest.fn().mockReturnValue(Date.now());
}

// Default export of the mock service
export default MockAIService;
