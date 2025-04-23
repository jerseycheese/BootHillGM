/**
 * Object Utility Functions
 * 
 * Helper functions for manipulating objects, particularly
 * useful in test environments.
 */

/**
 * Deep merge two objects
 * 
 * @param target - Target object to merge into
 * @param source - Source object to merge from
 * @returns Merged object
 */
export function deepMerge(target: any, source: any): any {
  // Start with a shallow copy of the target
  let output = Array.isArray(target) ? [...target] : { ...target };

  // Ensure source is an object before iterating
  if (isObject(source)) {
    for (const key in source) {
      // Ensure it's an own property of source
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        const sourceValue = source[key];
        const targetValue = target ? target[key] : undefined; // Get corresponding target value safely

        // If the source value is an object
        if (isObject(sourceValue)) {
          // Check if the target also has this key and its value is an object
          if (key in output && isObject(targetValue)) {
            // Both are objects, recurse
            output[key] = deepMerge(targetValue, sourceValue);
          } else {
            // Target doesn't have the key, or target value isn't an object
            // Assign the source object directly (potentially overwriting target's non-object value)
            // We should clone the source object here to avoid modifying the original source
            output[key] = deepClone(sourceValue); // Use deepClone for safety
          }
        } else {
          // Source value is not an object, assign it directly
          output[key] = sourceValue;
        }
      }
    }
  } else if (source !== undefined) {
      // If source is not an object but is defined (e.g., primitive, array), return source directly
      // This handles cases like deepMerge({a: 1}, 5) -> 5 or deepMerge({a: 1}, [1,2]) -> [1,2]
      // We should clone arrays to avoid modifying the original source
      output = Array.isArray(source) ? deepClone(source) : source;
  }
  
  return output;
}

/**
 * Check if value is an object
 * 
 * @param item - Value to check
 * @returns True if object, false otherwise
 */
function isObject(item: any): boolean {
  return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Deep clone an object
 * 
 * @param obj - Object to clone
 * @returns Cloned object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  // Handle Date
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as any;
  }
  
  // Handle Array
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item)) as any;
  }
  
  // Handle Object
  if (obj instanceof Object) {
    const copy: any = {};
    Object.keys(obj).forEach(key => {
      copy[key] = deepClone((obj as any)[key]);
    });
    return copy;
  }
  
  throw new Error(`Unable to copy object: ${obj}`);
}

/**
 * Pick specific properties from an object
 * 
 * @param obj - Source object
 * @param keys - Keys to pick
 * @returns New object with only the picked properties
 */
export function pick<T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  
  keys.forEach(key => {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      (result as any)[key] = obj[key];
    }
  });
  
  return result;
}

/**
 * Omit specific properties from an object
 * 
 * @param obj - Source object
 * @param keys - Keys to omit
 * @returns New object without the omitted properties
 */
export function omit<T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj } as any;
  
  keys.forEach(key => {
    delete result[key];
  });
  
  return result;
}

/**
 * Check if two objects are deeply equal
 * 
 * @param a - First object
 * @param b - Second object
 * @returns True if objects are deeply equal
 */
export function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }
  
  if (!a || !b || (typeof a !== 'object' && typeof b !== 'object')) {
    return a === b;
  }
  
  if (a === null || a === undefined || b === null || b === undefined) {
    return false;
  }
  
  if (a.prototype !== b.prototype) return false;
  
  const keys = Object.keys(a);
  if (keys.length !== Object.keys(b).length) return false;
  
  return keys.every(k => deepEqual(a[k], b[k]));
}
