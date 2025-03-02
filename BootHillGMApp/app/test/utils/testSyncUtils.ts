export const waitForStateUpdate = async (condition: () => boolean, timeout = 1000, interval = 50): Promise<boolean> => {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    if (condition()) {
      return true;
    }

    await new Promise(resolve => setTimeout(resolve, interval));
  }

  return false; // Timed out
};