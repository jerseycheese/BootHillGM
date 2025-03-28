/**
 * Custom event types and utilities for cross-component communication
 * Uses browser standard events for reliable messaging between components
 */

export const EVENTS = {
  // Decision-related events
  DECISION_READY: 'bhgm:decision:ready',
  DECISION_CLEARED: 'bhgm:decision:cleared',
  DECISION_MADE: 'bhgm:decision:made',
  
  // UI-related events
  UI_FORCE_UPDATE: 'bhgm:ui:force-update',
  UI_STATE_CHANGED: 'bhgm:ui:state-changed',
};

/**
 * Trigger a custom event with optional data.
 * Provides a standard way to communicate between React components.
 * 
 * @param eventName Name of the event to trigger (use EVENTS constants)
 * @param detail Optional data to pass with the event
 */
export const triggerCustomEvent = <T>(eventName: string, detail?: T): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const event = new CustomEvent(eventName, { 
      detail,
      bubbles: true, 
      cancelable: true 
    });
    
    window.dispatchEvent(event);
    
  } catch (error) {
    console.error(`Failed to trigger event ${eventName}:`, error);
  }
};

/**
 * Listen for a custom event.
 * Returns a cleanup function to remove the listener.
 * 
 * @param eventName Name of the event to listen for (use EVENTS constants)
 * @param callback Function to call when the event is triggered
 * @returns Cleanup function to remove the event listener
 */
export const listenForCustomEvent = <T>(
  eventName: string, 
  callback: (data?: T) => void
): () => void => {
  if (typeof window === 'undefined') return () => {};
  
  try {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<T>;
      callback(customEvent.detail);
    };
    
    window.addEventListener(eventName, handler);
    
    // Return cleanup function
    return () => {
      window.removeEventListener(eventName, handler);
    };
  } catch (error) {
    console.error(`Failed to listen for event ${eventName}:`, error);
    // Return a no-op cleanup function
    return () => {};
  }
};