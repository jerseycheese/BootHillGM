'use client';

import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import NarrativeOptimizationProvider from '../../../app/components/NarrativeOptimizationProvider';
import { applyGameServiceOptimization } from '../../../app/services/ai/gameServiceOptimizationPatch';
import { registerNarrativeContextDebugTools } from '../../../app/utils/narrative';

// Mock the dependencies
jest.mock('../../../app/services/ai/gameServiceOptimizationPatch', () => ({
  applyGameServiceOptimization: jest.fn()
}));

jest.mock('../../../app/utils/narrative', () => ({
  registerNarrativeContextDebugTools: jest.fn()
}));

// Mock console methods
const originalConsoleInfo = console.info;

describe('NarrativeOptimizationProvider', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock console methods
    console.info = jest.fn();
  });
  
  afterAll(() => {
    // Restore console methods
    console.info = originalConsoleInfo;
  });
  
  it('should render children', () => {
    const { getByText } = render(
      <NarrativeOptimizationProvider>
        <div>Test Child</div>
      </NarrativeOptimizationProvider>
    );
    
    expect(getByText('Test Child')).toBeInTheDocument();
  });
  
  it('should apply game service optimization on mount', () => {
    render(
      <NarrativeOptimizationProvider>
        <div>Test Child</div>
      </NarrativeOptimizationProvider>
    );
    
    expect(applyGameServiceOptimization).toHaveBeenCalledTimes(1);
  });
  
  it('should register debug tools in development mode', () => {
    // Save original NODE_ENV
    const originalNodeEnv = process.env.NODE_ENV;
    
    // Set to development
    process.env.NODE_ENV = 'development';
    
    render(
      <NarrativeOptimizationProvider>
        <div>Test Child</div>
      </NarrativeOptimizationProvider>
    );
    
    // Debug tools should be registered
    expect(registerNarrativeContextDebugTools).toHaveBeenCalledTimes(1);
    
    // Restore NODE_ENV
    process.env.NODE_ENV = originalNodeEnv;
  });
  
  it('should not register debug tools in production mode', () => {
    // Save original NODE_ENV
    const originalNodeEnv = process.env.NODE_ENV;
    
    // Set to production
    process.env.NODE_ENV = 'production';
    
    render(
      <NarrativeOptimizationProvider>
        <div>Test Child</div>
      </NarrativeOptimizationProvider>
    );
    
    // Debug tools should not be registered
    expect(registerNarrativeContextDebugTools).not.toHaveBeenCalled();
    
    // Restore NODE_ENV
    process.env.NODE_ENV = originalNodeEnv;
  });
  
  it('should log initialization message', () => {
    render(
      <NarrativeOptimizationProvider>
        <div>Test Child</div>
      </NarrativeOptimizationProvider>
    );
    
    expect(console.info).toHaveBeenCalledWith(
      expect.stringContaining('Narrative context optimization initialized')
    );
  });
  
  it('should only initialize once even with multiple renders', () => {
    const { rerender } = render(
      <NarrativeOptimizationProvider>
        <div>Test Child</div>
      </NarrativeOptimizationProvider>
    );
    
    // Initial render should initialize
    expect(applyGameServiceOptimization).toHaveBeenCalledTimes(1);
    expect(console.info).toHaveBeenCalledTimes(1);
    
    // Clear mocks to verify they're not called again
    jest.clearAllMocks();
    
    // Rerender with different children
    rerender(
      <NarrativeOptimizationProvider>
        <div>Different Child</div>
      </NarrativeOptimizationProvider>
    );
    
    // Should not initialize again
    expect(applyGameServiceOptimization).not.toHaveBeenCalled();
    expect(console.info).not.toHaveBeenCalled();
  });
});
