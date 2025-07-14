import 'dotenv/config';

export const jwtConfig = {
  access: {
    secret: process.env['JWT_SECRET'] || 'default_access_secret_change_me',
    expiresIn: process.env['JWT_ACCESS_EXPIRES_IN'] || '15m',
  },
  refresh: {
    secret: process.env['JWT_REFRESH_SECRET'] || 'default_refresh_secret_change_me',
    expiresIn: process.env['JWT_REFRESH_EXPIRES_IN'] || '7d',
  },
};