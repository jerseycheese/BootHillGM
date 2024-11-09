/**
 * Provides protected state updates with operation queueing and timeout handling.
 * Prevents race conditions in complex state updates by ensuring operations
 * execute sequentially when using the same key.
 */
export class StateProtection {
  private locks: Map<string, boolean>;
  private updateQueue: Map<string, Array<() => Promise<unknown>>>;
  
  constructor() {
    this.locks = new Map();
    this.updateQueue = new Map();
  }

  /**
   * Executes an operation with state protection.
   * - Prevents concurrent operations on the same key
   * - Optionally queues operations when key is locked
   * - Provides timeout protection for long-running operations
   * 
   * @param key Unique identifier for the protected operation
   * @param operation Async function to execute
   * @param options Configuration for queuing and timeout
   */
  async withProtection<T>(
    key: string, 
    operation: () => Promise<T>,
    options: { 
      queueing?: boolean;
      timeout?: number;
    } = {}
  ): Promise<T | undefined> {
    const { queueing = true, timeout = 5000 } = options;

    if (this.isLocked(key)) {
      if (!queueing) {
        throw new Error(`Operation already in progress for key: ${key}`);
      }
      
      return new Promise<T | undefined>((resolve, reject) => {
        const queue = this.updateQueue.get(key) || [];
        const wrappedOperation = async () => {
          try {
            const result = await operation();
            resolve(result);
          } catch (error) {
            reject(error);
          }
        };
        queue.push(wrappedOperation);
        this.updateQueue.set(key, queue);
      });
    }

    try {
      this.locks.set(key, true);
      const result = await Promise.race([
        operation(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error(`Operation timed out for key: ${key}`)), timeout)
        )
      ]);
      return result as T | undefined;
    } finally {
      this.locks.set(key, false);
      this.processQueue(key);
    }
  }

  /**
   * Processes the queue of pending operations for a given key.
   * Executes the next operation in the queue if the key is unlocked.
   * 
   * @param key Unique identifier for the protected operation
   */
  private async processQueue(key: string): Promise<void> {
    const queue = this.updateQueue.get(key) || [];
    if (queue.length === 0) return;

    const nextOperation = queue.shift();
    this.updateQueue.set(key, queue);
    
    if (nextOperation) {
      await this.withProtection(key, nextOperation);
    }
  }

  /**
   * Checks if a given key is currently locked.
   * 
   * @param key Unique identifier for the protected operation
   * @returns True if the key is locked, false otherwise
   */
  isLocked(key: string): boolean {
    return this.locks.get(key) || false;
  }

  /**
   * Gets the length of the operation queue for a given key.
   * 
   * @param key Unique identifier for the protected operation
   * @returns The number of pending operations in the queue
   */
  getQueueLength(key: string): number {
    return this.updateQueue.get(key)?.length || 0;
  }

  /**
   * Clears the operation queue for a given key.
   * 
   * @param key Unique identifier for the protected operation
   */
  clearQueue(key: string): void {
    this.updateQueue.set(key, []);
  }
}

export const createStateProtection = () => new StateProtection();
