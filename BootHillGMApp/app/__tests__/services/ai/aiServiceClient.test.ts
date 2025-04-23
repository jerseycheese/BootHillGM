/**
 * AI Service Client Tests
 * 
 * Tests for the external API client functionality
 */

import { callAIService, createError, isRetryableError, updateRateLimits } from '../../../services/ai/clients/aiServiceClient';
import { DecisionPrompt } from '../../../types/ai-service.types';
import { AIDecisionServiceConfig, ApiRateLimitData } from '../../../services/ai/types/aiDecisionTypes';

// Mock the global fetch function
global.fetch = jest.fn();
global.AbortSignal = {
  timeout: jest.fn().mockReturnValue({ /* Intentionally empty */ })
} as unknown;

describe('aiServiceClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('isRetryableError', () => {
    it('should identify network errors as retryable', () => {
      const networkError = new Error('Network error occurred');
      expect(isRetryableError(networkError)).toBe(true);
      
      const timeoutError = new Error('Request timed out');
      expect(isRetryableError(timeoutError)).toBe(true);
      
      const connectionError = new Error('Connection reset');
      expect(isRetryableError(connectionError)).toBe(true);
    });
    
    it('should identify server errors as retryable', () => {
      const serverError = new Error('500 Internal Server Error');
      expect(isRetryableError(serverError)).toBe(true);
    });
    
    it('should identify rate limiting errors as retryable', () => {
      const rateLimitError = new Error('429 Too Many Requests');
      expect(isRetryableError(rateLimitError)).toBe(true);
      
      const rateLimitTextError = new Error('Rate limit exceeded');
      expect(isRetryableError(rateLimitTextError)).toBe(true);
    });
    
    it('should identify other errors as non-retryable', () => {
      const validationError = new Error('Invalid parameters');
      expect(isRetryableError(validationError)).toBe(false);
      
      const authError = new Error('Unauthorized');
      expect(isRetryableError(authError)).toBe(false);
    });
  });
  
  describe('createError', () => {
    it('should create a standardized error object', () => {
      const error = createError('TEST_ERROR', 'Test error message', true);
      
      expect(error).toEqual({
        code: 'TEST_ERROR',
        message: 'Test error message',
        retryable: true
      });
    });
  });
  
  describe('updateRateLimits', () => {
    it('should update rate limit data from headers', () => {
      // Setup
      const headers = new Headers();
      headers.set('X-RateLimit-Remaining', '42');
      headers.set('X-RateLimit-Reset', '1609459200'); // Jan 1, 2021 in seconds
      
      const currentData: ApiRateLimitData = {
        remaining: 50,
        resetTime: 0
      };
      
      // Exercise
      const updatedData = updateRateLimits(headers, currentData);
      
      // Verify
      expect(updatedData).toEqual({
        remaining: 42,
        resetTime: 1609459200 * 1000 // Converted to milliseconds
      });
    });
    
    it('should preserve existing data when headers are missing', () => {
      // Setup
      const headers = new Headers();
      
      const currentData: ApiRateLimitData = {
        remaining: 50,
        resetTime: 1000
      };
      
      // Exercise
      const updatedData = updateRateLimits(headers, currentData);
      
      // Verify
      expect(updatedData).toEqual(currentData);
    });
  });
  
  describe('callAIService', () => {
    it('should throw an error when rate limited', async () => {
      // Setup
      const mockPrompt: Partial<DecisionPrompt> = { /* Intentionally empty */ };
      const mockConfig: Partial<AIDecisionServiceConfig> = { 
        apiConfig: { /* Intentionally empty */ } 
      };
      const mockRateLimitData: ApiRateLimitData = {
        remaining: 0,
        resetTime: Date.now() + 10000 // Reset 10 seconds in the future
      };
      
      // Exercise & Verify
      await expect(callAIService(
        mockPrompt as DecisionPrompt, 
        mockConfig as AIDecisionServiceConfig, 
        mockRateLimitData
      )).rejects.toMatchObject({
        code: 'RATE_LIMITED',
        message: 'Rate limit exceeded',
        retryable: true
      });
      
      // Ensure fetch was never called
      expect(fetch).not.toHaveBeenCalled();
    });
    
    // Additional tests for callAIService would include:
    // - Testing successful API calls
    // - Testing retry behavior
    // - Testing error handling
    // These would require more extensive mocking of fetch responses
  });
});
