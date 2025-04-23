/**
 * Tests for stateProtection utilities
 */
import { withProtection, clearQueue } from '../../utils/stateProtection';

describe('StateProtection', () => {
  // Set up jest fake timers to control async operations
  beforeEach(() => {
    jest.useFakeTimers();
  });
  
  afterEach(() => {
    jest.useRealTimers();
  });
  
  test('handles single operation correctly', async () => {
    const operation = jest.fn().mockResolvedValue('result');
    const promise = withProtection('test', operation);
    jest.advanceTimersByTime(100);
    const result = await promise;
    expect(result).toBe('result');
    expect(operation).toHaveBeenCalledTimes(1);
  });
  
  test('prevents concurrent operations on same key', async () => {
    const operation1 = jest.fn().mockImplementation(() => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve('first');
        }, 200);
      });
    });
    const operation2 = jest.fn().mockResolvedValue('second');
    
    const promise1 = withProtection('test', operation1);
    const promise2 = withProtection('test', operation2);
    
    jest.advanceTimersByTime(100);
    expect(operation1).toHaveBeenCalledTimes(1);
    expect(operation2).not.toHaveBeenCalled();
    
    jest.advanceTimersByTime(200);
    await promise1;
    
    jest.advanceTimersByTime(100);
    expect(operation2).toHaveBeenCalledTimes(1);
    
    const result2 = await promise2;
    expect(result2).toBe('second');
  });
  
  test('queues operations when key is locked', async () => {
    const results: string[] = [];
    
    const operation1 = jest.fn().mockImplementation(() => {
      return new Promise(resolve => {
        setTimeout(() => {
          results.push('first');
          resolve('first');
        }, 200);
      });
    });
    
    const operation2 = jest.fn().mockImplementation(() => {
      return new Promise(resolve => {
        setTimeout(() => {
          results.push('second');
          resolve('second');
        }, 100);
      });
    });
    
    const promise1 = withProtection('test', operation1);
    const promise2 = withProtection('test', operation2);
    
    jest.advanceTimersByTime(100);
    expect(operation1).toHaveBeenCalledTimes(1);
    expect(operation2).not.toHaveBeenCalled();
    
    jest.advanceTimersByTime(200);
    await promise1;
    
    jest.advanceTimersByTime(200);
    await promise2;
    
    expect(results).toEqual(['first', 'second']);
  });
  
  test('handles operation timeout', async () => {
    const slowOperation = jest.fn().mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve('slow'), 2000))
    );
    
    const promise = withProtection('test', slowOperation, { 
      timeout: 1000 
    });
    
    jest.advanceTimersByTime(1100);
    
    await expect(promise).rejects.toThrow('Operation on test timed out after 1000ms');
    expect(slowOperation).toHaveBeenCalledTimes(1);
  });
  
  test('maintains separate locks for different keys', async () => {
    const operation1 = jest.fn().mockImplementation(() => {
      return new Promise(resolve => {
        setTimeout(() => resolve('first'), 200);
      });
    });
    const operation2 = jest.fn().mockResolvedValue('second');
    
    const promise1 = withProtection('key1', operation1);
    const promise2 = withProtection('key2', operation2);
    
    jest.advanceTimersByTime(100);
    expect(operation1).toHaveBeenCalledTimes(1);
    expect(operation2).toHaveBeenCalledTimes(1);
    
    jest.advanceTimersByTime(200);
    
    const [result1, result2] = await Promise.all([promise1, promise2]);
    expect(result1).toBe('first');
    expect(result2).toBe('second');
  });
  
  test('clears queue for specific key', async () => {
    const operation = jest.fn().mockImplementation(() => {
      return new Promise(resolve => {
        setTimeout(() => resolve('result'), 200);
      });
    });
    
    // Queue up operations
    const promise1 = withProtection('test', operation);
    withProtection('test', operation);
    
    clearQueue('test');
    
    jest.advanceTimersByTime(200);
    await promise1;
    
    jest.advanceTimersByTime(200);
    expect(operation).toHaveBeenCalledTimes(1);
  });
  
  test('handles errors in queued operations', async () => {
    const errorOperation = jest.fn().mockImplementation(() => {
      return new Promise((_, reject) => {
        setTimeout(() => reject(new Error('test error')), 200);
      });
    });
    
    const successOperation = jest.fn().mockResolvedValue('success');
    
    const errorPromise = withProtection('test', errorOperation);
    const successPromise = withProtection('test', successOperation);
    
    jest.advanceTimersByTime(100);
    expect(errorOperation).toHaveBeenCalledTimes(1);
    expect(successOperation).not.toHaveBeenCalled();
    
    jest.advanceTimersByTime(200);
    await expect(errorPromise).rejects.toThrow('test error');
    
    jest.advanceTimersByTime(100);
    expect(successOperation).toHaveBeenCalledTimes(1);
    
    const successResult = await successPromise;
    expect(successResult).toBe('success');
  });
});
