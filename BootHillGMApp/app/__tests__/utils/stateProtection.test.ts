import { StateProtection, createStateProtection } from '../../utils/stateProtection';

describe('StateProtection', () => {
  let stateProtection: StateProtection;

  beforeEach(() => {
    stateProtection = createStateProtection();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  test('handles single operation correctly', async () => {
    const operation = jest.fn().mockResolvedValue('result');
    const promise = stateProtection.withProtection('test', operation);
    jest.advanceTimersByTime(100);
    const result = await promise;
    expect(result).toBe('result');
    expect(operation).toHaveBeenCalledTimes(1);
  });

  test('prevents concurrent operations on same key', async () => {
    const operation1 = jest.fn().mockImplementation(() => 
      Promise.resolve('first')
    );
    const operation2 = jest.fn().mockResolvedValue('second');

    const promise1 = stateProtection.withProtection('test', operation1);
    const promise2 = stateProtection.withProtection('test', operation2);

    jest.advanceTimersByTime(100);
    
    const [result1, result2] = await Promise.all([promise1, promise2]);
    
    expect(result1).toBe('first');
    expect(result2).toBe('second');
    expect(operation1).toHaveBeenCalledTimes(1);
    expect(operation2).toHaveBeenCalledTimes(1);
  });

  test('queues operations when key is locked', async () => {
    const results: string[] = [];
    const operation1 = jest.fn().mockImplementation(async () => {
      results.push('first');
      return 'first';
    });
    const operation2 = jest.fn().mockImplementation(async () => {
      results.push('second');
      return 'second';
    });

    const promise1 = stateProtection.withProtection('test', operation1);
    const promise2 = stateProtection.withProtection('test', operation2);

    jest.advanceTimersByTime(100);
    
    await Promise.all([promise1, promise2]);
    
    expect(results).toEqual(['first', 'second']);
    expect(operation1).toHaveBeenCalledTimes(1);
    expect(operation2).toHaveBeenCalledTimes(1);
  });

  test('handles operation timeout', async () => {
    const slowOperation = jest.fn().mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 6000))
    );

    const promise = stateProtection.withProtection('test', slowOperation, { 
      timeout: 1000 
    });

    jest.advanceTimersByTime(1001);

    await expect(promise).rejects.toThrow('Operation timed out');
  });

  test('maintains separate locks for different keys', async () => {
    const operation1 = jest.fn().mockResolvedValue('first');
    const operation2 = jest.fn().mockResolvedValue('second');

    const promise1 = stateProtection.withProtection('key1', operation1);
    const promise2 = stateProtection.withProtection('key2', operation2);

    jest.advanceTimersByTime(100);
    
    const [result1, result2] = await Promise.all([promise1, promise2]);
    
    expect(result1).toBe('first');
    expect(result2).toBe('second');
    expect(operation1).toHaveBeenCalledTimes(1);
    expect(operation2).toHaveBeenCalledTimes(1);
  });

  test('clears queue for specific key', async () => {
    const operation = jest.fn().mockResolvedValue('result');

    // Queue up operations
    const promise1 = stateProtection.withProtection('test', operation);
    stateProtection.withProtection('test', operation);
    
    stateProtection.clearQueue('test');
    expect(stateProtection.getQueueLength('test')).toBe(0);

    jest.advanceTimersByTime(100);
    await promise1;
    
    expect(operation).toHaveBeenCalledTimes(1);
  });

  test('handles errors in queued operations', async () => {
    const errorOperation = jest.fn().mockRejectedValue(new Error('Test error'));
    const successOperation = jest.fn().mockResolvedValue('success');

    const errorPromise = stateProtection.withProtection('test', errorOperation);
    const successPromise = stateProtection.withProtection('test', successOperation);

    jest.advanceTimersByTime(100);

    await expect(errorPromise).rejects.toThrow('Test error');
    await successPromise;

    expect(errorOperation).toHaveBeenCalledTimes(1);
    expect(successOperation).toHaveBeenCalledTimes(1);
  });
});
