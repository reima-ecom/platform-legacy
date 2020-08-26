import test from 'ava';
import pipe from './pipe-async.js';

const array = [1, 5, 8, 6];
const add = (num) => (element) => element + num;
const squareAsync = (element) => Promise.resolve(element ** 2);

test('works', async (t) => {
  const addNsquare = pipe(add(2), squareAsync);
  const result = await addNsquare(array);
  t.deepEqual(result, [9, 49, 100, 64]);
});
