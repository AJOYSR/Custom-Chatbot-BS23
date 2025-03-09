const { SENDGRID_API_KEY, EMAIL_ADDRESS, CHANGE_EMAIL_EXPIRATION_TIME } =
  process.env;

export const mailConfig = {
  user: EMAIL_ADDRESS || "hello@bs23.com",
  apiKey: SENDGRID_API_KEY || "SG.",
  changeEmail: {
    expirationTime: parseInt(CHANGE_EMAIL_EXPIRATION_TIME) || 120000, // 2 minutes
  },
};
