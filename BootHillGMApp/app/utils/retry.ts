/**
 * Retry a function with exponential backoff
 * 
 * @param fn Function to retry
 * @param maxRetries Maximum number of retries
 * @param initialDelay Initial delay in milliseconds
 * @param maxDelay Maximum delay in milliseconds
 * @returns Promise resolving to the function result
 */
export async function retryWithExponentialBackoff<T>(
  fn: () => Promise<T>, 
  maxRetries = 3,
  initialDelay = 1000,
  maxDelay = 8000
): Promise<T> {
  let lastError: Error | unknown;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log(`Attempt ${i + 1}/${maxRetries}`);
      const result = await fn();
      return result;
    } catch (error) {
      console.error(`Retry attempt ${i + 1} failed:`, error);
      lastError = error;
      
      if (i === maxRetries - 1) {
        console.error("Max retries reached, throwing error");
        throw error;
      }
      
      // Calculate backoff delay with jitter (randomness)
      const exponentialDelay = Math.min(
        initialDelay * Math.pow(2, i), 
        maxDelay
      );
      const jitter = Math.random() * 0.3 * exponentialDelay; // 0-30% jitter
      const delay = exponentialDelay + jitter;
      
      console.log(`Retrying after ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError || new Error('Max retries reached');
}

/**
 * Creates a promise that rejects after a specified timeout
 * 
 * @param ms Timeout in milliseconds
 * @param message Custom error message
 * @returns A promise that rejects after the specified timeout
 */
export function timeoutPromise(ms: number, message?: string): Promise<never> {
  return new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(message || `Operation timed out after ${ms}ms`));
    }, ms);
  });
}

/**
 * Wrap a promise with a timeout
 * 
 * @param promise Promise to wrap with timeout
 * @param ms Timeout in milliseconds
 * @param message Custom error message
 * @returns Promise with timeout
 */
export function withTimeout<T>(
  promise: Promise<T>, 
  ms: number, 
  message?: string
): Promise<T> {
  return Promise.race([
    promise,
    timeoutPromise(ms, message)
  ]);
}
