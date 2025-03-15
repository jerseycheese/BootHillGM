/**
 * Utility for conditionally joining classNames together
 * 
 * Similar to the popular 'clsx' or 'classnames' libraries
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export default cn;
