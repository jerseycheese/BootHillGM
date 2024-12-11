import { getAIModel } from '../../utils/aiService';
import { retryWithExponentialBackoff } from '../../utils/retry';

// Keep track of recently generated names to avoid repetition
const recentNames: string[] = [];
const MAX_RECENT_NAMES = 10;

export function isNameTooSimilar(newName: string): boolean {
  return recentNames.some(existingName => {
    // Convert both names to lowercase for comparison
    const name1 = newName.toLowerCase();
    const name2 = existingName.toLowerCase();
    
    // Check if either name is a substring of the other
    if (name1.includes(name2) || name2.includes(name1)) return true;
    
    // Split names into parts and check for matching parts
    const parts1 = name1.split(' ');
    const parts2 = name2.split(' ');
    
    // If they share any name parts, consider them too similar
    return parts1.some(part1 => parts2.includes(part1));
  });
}

export function addToRecentNames(name: string) {
  recentNames.unshift(name);
  if (recentNames.length > MAX_RECENT_NAMES) {
    recentNames.pop();
  }
}

export async function generateName(): Promise<string> {
    const prompt = `Generate a single name for a character in a Western-themed RPG set in the American Old West (1865-1890).
    - Should be a full name (first and last)
    - Historically appropriate for the time period
    - No titles or descriptors
    - No quotation marks or extra punctuation
    Provide only the name.`;
    
    try {
      const model = getAIModel();
      const result = await retryWithExponentialBackoff(() => model.generateContent(prompt));
      const response = await result.response;
      const name = response.text()
        .trim()
        .replace(/["']/g, '')
        .replace(/\.+$/, '')
        .replace(/^(Mr\.|Mrs\.|Miss|Dr\.|Rev\.) /i, '')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');

      if (name.split(' ').length >= 2 && /^[A-Za-z\s-]+$/.test(name)) {
        if (!isNameTooSimilar(name)) {
          addToRecentNames(name);
          return name;
        }
      }
      throw new Error('Invalid name generated');
    } catch {
      const firstNames = [
        'John', 'William', 'James', 'Charles', 'George',
        'Frank', 'Jesse', 'Thomas', 'Henry', 'Robert',
        'Sarah', 'Mary', 'Elizabeth', 'Annie', 'Margaret'
      ];
      const lastNames = [
        'Smith', 'Johnson', 'Williams', 'Brown', 'Jones',
        'Miller', 'Davis', 'Wilson', 'Anderson', 'Taylor',
        'Thompson', 'Walker', 'Harris', 'Martin', 'Moore'
      ];
      
      let attempts = 0;
      let generatedName;
      do {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        generatedName = `${firstName} ${lastName}`;
        attempts++;
      } while (isNameTooSimilar(generatedName) && attempts < 10);

      if (!isNameTooSimilar(generatedName)) {
        addToRecentNames(generatedName);
        return generatedName;
      }
      
      const firstName = firstNames[attempts % firstNames.length];
      const lastName = lastNames[(attempts + 5) % lastNames.length];
      generatedName = `${firstName} ${lastName}`;
      addToRecentNames(generatedName);
      return generatedName;
    }
}
