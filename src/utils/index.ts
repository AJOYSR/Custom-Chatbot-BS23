import mongoose from 'mongoose';
const RoleMap = {
  'super-admin': 'Super Admin',
  customer: 'Customer',
};

// Function to get the friendly name from the role
export function getRoleLabel(role: string) {
  return RoleMap[role];
}

export function toObjectId(id: string): mongoose.Types.ObjectId {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid ObjectId format');
  }
  return new mongoose.Types.ObjectId(id);
}
/**
 * Extracts a JSON object from a string containing JSON.
 * @param {string} text - The text containing JSON.
 * @returns {object|null} - The extracted JSON object or null if extraction fails.
 */
export function extractJsonFromText(text: string) {
  try {
    // Look for patterns that might be JSON objects
    const jsonRegex = /{[\s\S]*?}/g;
    const matches = text.match(jsonRegex);

    if (!matches || matches.length === 0) {
      return null;
    }

    // Try to parse each match until we find valid JSON
    for (const match of matches) {
      try {
        const parsedJson = JSON.parse(match);
        // Check if the parsed object has the expected structure
        if (
          parsedJson &&
          parsedJson.questions &&
          Array.isArray(parsedJson.questions)
        ) {
          return parsedJson;
        }
      } catch (innerError) {
        // Skip invalid JSON matches
        continue;
      }
    }

    // If we haven't returned yet, try to parse the largest match
    // (which is likely to be the complete JSON object)
    const largestMatch = matches.reduce(
      (a, b) => (a.length > b.length ? a : b),
      '',
    );
    return JSON.parse(largestMatch);
  } catch (error) {
    console.error('Error extracting JSON:', error);
    return null;
  }
}
