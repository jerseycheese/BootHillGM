/**
 * Context Actions Tests
 * 
 * Tests for the context action generator.
 */

import { createContextAction } from './contextActions';
import { ResponseContextType } from './constants';
import { ActionType } from './contextActionTypes';
import { contextActionTemplates } from './actionTemplates';

describe('Context Action Generator', () => {
  test('should create a context action with default location', () => {
    const action = createContextAction('main', ResponseContextType.INITIALIZING);
    
    expect(action).toEqual(expect.objectContaining({
      id: expect.stringContaining('fallback-initializing-main'),
      title: expect.stringContaining('Explore Boothill'),
      description: expect.any(String),
      type: 'main'
    }));
  });
  
  test('should create a context action with custom location', () => {
    const action = createContextAction('main', ResponseContextType.INITIALIZING, 'Deadwood');
    
    expect(action).toEqual(expect.objectContaining({
      id: expect.stringContaining('fallback-initializing-main'),
      title: expect.stringContaining('Explore Deadwood'),
      description: expect.any(String),
      type: 'main'
    }));
  });
  
  test('should create a looking context action', () => {
    const action = createContextAction('combat', ResponseContextType.LOOKING);
    
    expect(action).toEqual(expect.objectContaining({
      id: expect.stringContaining('fallback-looking-combat'),
      title: 'Look for armed individuals',
      description: 'Identify potential threats',
      type: 'combat'
    }));
  });
  
  test('should create a movement context action', () => {
    const action = createContextAction('danger', ResponseContextType.MOVEMENT);
    
    expect(action).toEqual(expect.objectContaining({
      id: expect.stringContaining('fallback-movement-danger'),
      title: 'Move carefully and quietly',
      description: 'Avoid attracting attention',
      type: 'danger'
    }));
  });
  
  test('should fallback to generic context for unknown context types', () => {
    // @ts-expect-error - Intentionally testing with invalid context
    const action = createContextAction('main', 'unknown-context');
    
    expect(action).toEqual(expect.objectContaining({
      id: expect.stringContaining('fallback-generic-main'),
      title: 'Focus on your objective',
      description: 'Remember why you\'re here',
      type: 'main'
    }));
  });
  
  test('should fallback to basic action for unknown action types', () => {
    // @ts-expect-error - Intentionally testing with invalid action type
    const action = createContextAction('unknown-action', ResponseContextType.TALKING);
    
    expect(action).toEqual(expect.objectContaining({
      id: expect.stringContaining('fallback-talking-unknown-action'),
      title: 'Listen carefully',
      description: 'Pay attention to what\'s being said',
      type: 'unknown-action'
    }));
  });
  
  // Additional tests for improved coverage
  
  test('all action types should have templates for each context', () => {
    // Get all known action types from one template
    const actionTypes = Object.keys(contextActionTemplates[ResponseContextType.GENERIC]);
    
    // Check each context type has all action types
    Object.values(ResponseContextType).forEach(contextType => {
      const templates = contextActionTemplates[contextType];
      
      actionTypes.forEach(actionType => {
        expect(templates).toHaveProperty(actionType);
        expect(templates[actionType as ActionType]).toHaveProperty('title');
        expect(templates[actionType as ActionType]).toHaveProperty('description');
      });
    });
  });
  
  // Parameterized tests for each context type
  const testCases = Object.values(ResponseContextType);
  
  test.each(testCases)('should create basic action for %s context', (contextType) => {
    const action = createContextAction('basic', contextType as ResponseContextType);
    
    expect(action).toMatchObject({
      id: expect.stringContaining(`fallback-${contextType}-basic`),
      type: 'basic'
    });
  });
});
