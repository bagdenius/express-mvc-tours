declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production';
      PORT: string;

      DATABASE_USERNAME: string;
      DATABASE_PASSWORD: string;
      DATABASE: string;

      JWT_SECRET: string;
      JWT_EXPIRES_IN: string;
      JWT_EXPIRES_IN_COOKIE: string;

      EMAIL_USERNAME: string;
      EMAIL_PASSWORD: string;
      EMAIL_HOST: string;
      EMAIL_PORT: string;
    }
  }
}

export {};
