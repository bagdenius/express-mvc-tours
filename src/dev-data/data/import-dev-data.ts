import '../../load-env.ts';

import fs from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import mongoose from 'mongoose';

import { Review } from '../../models/review-model.ts';
import { Tour } from '../../models/tour-model.ts';
import { User } from '../../models/user-model.ts';

export const __filename = fileURLToPath(import.meta.url);
export const __dirname = dirname(__filename);

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

await mongoose.connect(DB);

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}src/dev-data/data/tours.json`, 'utf8'),
);
const users = JSON.parse(
  fs.readFileSync(`${__dirname}src/dev-data/data/users.json`, 'utf8'),
);
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}src/dev-data/data/reviews.json`, 'utf8'),
);

async function importData() {
  try {
    await Tour.create(tours);
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews);
    console.log('Data succesfully loaded!');
  } catch (error) {
    console.error(error);
  }
}

async function deleteData() {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('Data successfully deleted!');
  } catch (error) {
    console.error(error);
  }
}

if (process.argv.includes('--delete')) await deleteData();
if (process.argv.includes('--import')) await importData();

process.exit();
