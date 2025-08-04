/**
 * Utility to generate test tokens for patient packet links
 * This is for development purposes only
 */

/**
 * Generate a base64 token from a lead ID
 */
export function generatePatientPacketToken(leadId: string): string {
  return btoa(leadId);
}

/**
 * Decode a patient packet token to get the lead ID
 */
export function decodePatientPacketToken(token: string): string {
  try {
    return atob(token);
  } catch (error) {
    throw new Error('Invalid token format');
  }
}

/**
 * Validate if a string is a valid UUID
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Generate a test URL for a lead ID
 */
export function generateTestPatientPacketUrl(leadId: string, baseUrl: string = 'http://localhost:8081'): string {
  if (!isValidUUID(leadId)) {
    throw new Error('Invalid lead ID format. Must be a valid UUID.');
  }
  
  const token = generatePatientPacketToken(leadId);
  return `${baseUrl}/patient-packet/${token}`;
}

// Example usage:
// const leadId = 'f0f9b0fa-8119-4980-b288-fb3203ea2072';
// const url = generateTestPatientPacketUrl(leadId);
// console.log('Test URL:', url);
