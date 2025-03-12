export async function retryWithExponentialBackoff<T>(
  fn: () => Promise<T>, 
  maxRetries = 3
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await fn(); // Store the result
      return result; // Return after the try...catch
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
  throw new Error('Max retries reached');
}
