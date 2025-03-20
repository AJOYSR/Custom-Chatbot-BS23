import mongoose from 'mongoose';

/**
 * Generates a strong random password.
 * @returns A randomly generated password consisting of lowercase letters and numeric characters.
 */
export const generateStrongPassword = (): string => {
  // Defines sets of characters for lowercase letters and numeric characters.
  const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
  const numericChars = '123456789';
  const allChars = lowercaseChars + numericChars;

  let password = '';
  // Generates an 8-character password by randomly selecting characters from the combined set.
  for (let i = 0; i < 8; i++) {
    const randomIndex = Math.floor(Math.random() * allChars.length);
    password += allChars.charAt(randomIndex);
  }

  return password;
};

/**
 * Generates a six-digit verification code.
 * @returns A string representing the generated verification code.
 */
export const generateSixDigitCode = (): string => {
  // Generate a random number between 100000 and 999999 (inclusive)
  const code = Math.floor(100000 + Math.random() * 900000);
  return code.toString(); // Convert the number to a string
};

export const returnMongoObjectId = (id: string) => {
  if (id) {
    return new mongoose.Types.ObjectId(id);
  }
};

export function deepClone(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof RegExp) {
    return new RegExp(obj);
  }

  const clone: any = Array.isArray(obj) ? [] : {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      clone[key] = deepClone(obj[key]);
    }
  }

  return clone;
}
export function generateSearchQuery(condition: {
  botId?: string;
  q?: string;
}): object {
  const { botId, q } = condition;
  console.log('🚀 ~ condition:', condition);
  const query: Record<string, any> = {};

  if (q !== undefined && q !== '') {
    query.name = new RegExp(q, 'i');
  }

  if (botId !== undefined && botId !== '') {
    // Ensure botId is converted to ObjectId safely
    query.botId = mongoose.Types.ObjectId.isValid(botId)
      ? new mongoose.Types.ObjectId(botId)
      : botId; // Changed from null to botId
  }

  return query;
}
