const DEBUG_ENABLED = true;

export function debugStorage() {
  // Storage debugging remains disabled in production
  if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
    // Storage state checks remain available in development
  }
}
