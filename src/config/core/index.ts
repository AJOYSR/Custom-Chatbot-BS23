const {
  PORT,
  ENV,
  HOST,
  API_PREFIX,
  BASE_URL,
  FRONTEND_BASE_URL,
  PAGINATION_LIMIT,
} = process.env;

export const coreConfig = {
  port: parseInt(PORT) || 4040,
  host: HOST || 'localhost',
  apiPrefix: API_PREFIX || 'api',
  baseUrl: BASE_URL || 'http://localhost:4000',
  frontendBaseUrl: FRONTEND_BASE_URL || 'http://localhost:4041',
  env: ENV || 'development',
  paginationLimit: parseInt(PAGINATION_LIMIT) || 10,
};
