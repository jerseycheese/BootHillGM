/**
 * Utility functions for date and time formatting
 */

/**
 * Formats a timestamp into a date string in MM/DD/YYYY format
 * 
 * @param timestamp - Unix timestamp (milliseconds)
 * @returns Formatted date string
 */
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  
  // Get month, day, and year
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const year = date.getFullYear();
  
  // Format as MM/DD/YYYY
  return `${month}/${day}/${year}`;
}

/**
 * Formats a timestamp as a time string in HH:MM format
 * 
 * @param timestamp - Unix timestamp (milliseconds)
 * @returns Formatted time string
 */
export function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  
  // Get hours and minutes
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  // Format as HH:MM
  return `${hours}:${minutes}`;
}

/**
 * Formats a timestamp as a date and time string
 * 
 * @param timestamp - Unix timestamp (milliseconds)
 * @returns Formatted date and time string
 */
export function formatDateTime(timestamp: number): string {
  return `${formatDate(timestamp)} ${formatTime(timestamp)}`;
}
