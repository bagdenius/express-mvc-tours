import './load-env.ts';

import mongoose from 'mongoose';

import { app } from './app.ts';

const DB = process.env.DATABASE!.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD!,
);

await mongoose.connect(DB);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}...`);
});
