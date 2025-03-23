import React from 'react';

/**
 * StoryWrapper component
 * 
 * A wrapper component that provides consistent styling context for stories.
 * This is similar to how you'd wrap Drupal components in theme regions,
 * providing base styling and structure.
 */
const StoryWrapper = ({ children }) => {
  return (
    <div className="p-4 bg-white dark:bg-slate-800 text-black dark:text-white min-h-screen">
      {/* Inline styles as backup if Tailwind fails to load */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '1rem',
        backgroundColor: 'var(--background, white)',
        color: 'var(--foreground, black)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}>
        {children}
      </div>
    </div>
  );
};

export default StoryWrapper;
