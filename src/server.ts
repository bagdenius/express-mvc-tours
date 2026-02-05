import './load-env.ts';

import mongoose from 'mongoose';

import { app } from './app.ts';

process.on('uncaughtException', (error: Error) => {
  console.log('❌ UNCAUGHT EXCEPTION! Shutting down...');
  console.log(`${error.name}: ${error.message}`);
  process.exit(1);
});

const DB = process.env.DATABASE!.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD!,
);

const connection = await mongoose.connect(DB);

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}...`);
});

process.on('unhandledRejection', (error: Error) => {
  console.log('❌ UNHANDLED REJECTION! Shutting down...');
  console.log(error);
  server.close(() => process.exit(1));
});
