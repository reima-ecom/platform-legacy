// eslint-disable-next-line import/no-extraneous-dependencies
import test from 'ava';
import { getCache } from '@reima-ecom/lib';
import mapProductIdsToHandles from './id-to-handle-map.js';

const cache = getCache('./test');

test('Gets map of legacy id to handle', async (t) => {
  const map = await mapProductIdsToHandles(cache.readLines('products.jsonl'));
  t.deepEqual(map, {
    1586955943991: 'beanie-hattara',
    1586956009527: 'beanie-luumu',
    1586956304439: 'fleece-overall-myytti',
  });
});
