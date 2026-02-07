import '../../load-env.ts';

import fs from 'node:fs';

import mongoose from 'mongoose';

import { Tour } from '../../models/tour-model.ts';
import { __dirname } from '../../utils/path.ts';

const DB = process.env.DATABASE!.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD!,
);

await mongoose.connect(DB);

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours.json`, 'utf8'),
);

async function importData() {
  try {
    await Tour.create(tours);
    console.log('Data succesfully loaded!');
  } catch (error) {
    console.error(error);
  }
}

async function deleteData() {
  try {
    await Tour.deleteMany();
    console.log('Data successfully deleted!');
  } catch (error) {
    console.error(error);
  }
}

if (process.argv.includes('--delete')) await deleteData();
if (process.argv.includes('--import')) await importData();

process.exit();
