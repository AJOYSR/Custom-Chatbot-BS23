const {
  JWT_SECRET_KEY,
  JWT_EXPIRATION_TIME,
  JWT_SALT,
  FORGOT_PASSWORD_EXPIRATION_TIME,
  RESET_PASSWORD_ORIGINAL_URL,
} = process.env;

export const authConfig = {
  salt: parseInt(JWT_SALT) || 10,
  expiration_time: JWT_EXPIRATION_TIME || '30d',
  jwt_key: JWT_SECRET_KEY || '@CUSTOM_BOT_BS23@',
  forgotPassword: {
    expirationTime: parseInt(FORGOT_PASSWORD_EXPIRATION_TIME) || 3600000, // 1 hour = 3600000 milliseconds
    resetUrl: RESET_PASSWORD_ORIGINAL_URL || 'auth/jwt/new-password',
  },
};
