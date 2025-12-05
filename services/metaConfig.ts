/**
 * Meta Pixel Configuration
 * 
 * IMPORTANT: This file contains test mode settings for Meta Pixel.
 * See docs/META_PIXEL_TEST_MODE.md for instructions on disabling test mode.
 */

export const META_CONFIG = {
  /**
   * TEST MODE CONFIGURATION
   * 
   * When TEST_MODE_ENABLED is true:
   * - Events are sent to Facebook's Test Events tab
   * - Events will NOT appear in production analytics
   * - Useful for development and testing
   * 
   * To disable test mode and send to production:
   * 1. Set TEST_MODE_ENABLED to false
   * 2. Follow removal instructions in docs/META_PIXEL_TEST_MODE.md
   */
  TEST_MODE_ENABLED: true,
  
  /**
   * Test Event Code
   * Used by Facebook to identify and route test events
   * Only used when TEST_MODE_ENABLED is true
   */
  TEST_EVENT_CODE: 'TEST20053',
  
  /**
   * Event ID Prefix
   * Helps identify events from this application in Facebook Events Manager
   * Format: {prefix}_{random}_{timestamp}
   * Example: hc_a1b2c3d4e_1733400000000
   */
  EVENT_ID_PREFIX: 'hc',
};

/**
 * Generate a unique event ID for deduplication
 * Used to match browser-side and server-side events
 */
export function generateEventId(): string {
  const random = Math.random().toString(36).substring(2, 11);
  const timestamp = Date.now();
  return `${META_CONFIG.EVENT_ID_PREFIX}_${random}_${timestamp}`;
}
