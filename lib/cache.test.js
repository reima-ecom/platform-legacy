import test from 'ava';
import { promises as fs } from 'fs';
import path from 'path';
import getCache from './cache.js';

const TEST_CACHE_DIR = './public/cache-test';

test.serial('writing to cache works', async (t) => {
  const filename = 'cache.json';
  const obj = { hello: 'world' };
  await getCache(TEST_CACHE_DIR).write(filename, obj);
  const file = await fs.readFile(path.join(TEST_CACHE_DIR, filename));
  const actual = JSON.parse(file.toString());
  t.deepEqual(actual, obj);
  await fs.rmdir(TEST_CACHE_DIR, { recursive: true });
});
