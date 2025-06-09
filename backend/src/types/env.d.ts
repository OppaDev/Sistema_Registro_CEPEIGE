declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    PORT: string;
    DATABASE_URL: string;
    ALLOWED_ORIGINS: string;
    RATE_LIMIT_WINDOW_MS: string;
    RATE_LIMIT_MAX_REQUESTS: string;
    JWT_SECRET: string;
    JWT_EXPIRES_IN: string;
    EMAIL_HOST: string;
    EMAIL_PORT: string;
    EMAIL_USER: string;
    EMAIL_PASS: string;
    MAX_FILE_SIZE_BYTES: string;
    UPLOAD_PATH: string;
    LOG_LEVEL: string;
    LOG_FILE: string;
  }
}