declare module '*.css';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      VITE_API_URL: string;

      NODE_ENV: 'development' | 'production';
      PORT: string;

      DATABASE_USERNAME: string;
      DATABASE_PASSWORD: string;
      DATABASE: string;

      JWT_SECRET: string;
      JWT_EXPIRES_IN: string;
      JWT_EXPIRES_IN_COOKIE: string;

      EMAIL_FROM: string;
      EMAIL_HOST: string;
      EMAIL_PORT: string;
      EMAIL_USERNAME: string;
      EMAIL_PASSWORD: string;

      SENDGRID_HOST: string;
      SENDGRID_PORT: string;
      SENDGRID_USERNAME: string;
      SENDGRID_PASSWORD: string;

      VITE_STRIPE_PUBLISHABLE_KEY: string;
      STRIPE_SECRET_KEY: string;

      VITE_MAPBOX_PUBLIC_TOKEN: string;
    }
  }
}

export {};
