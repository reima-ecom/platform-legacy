import test from 'ava';
import setVariantImageIndexes from './variant-images.js';

test('sets image colors', (t) => {
  /** @type {import('./shopify-transform.js').Product} */
  const product = {
    images: [
      { originalSrc: 'this-is-one.jpg' },
      { originalSrc: 'black-back.jpg' },
      { originalSrc: '//shopify.com/someimage.jpg' },
      { originalSrc: 'purple-haze-back.jpg' },
      { originalSrc: 'purple-back.jpg' },
    ],
    variants: [
      // @ts-ignore
      { imageOriginalSrc: 'this-is-one.jpg' },
      // @ts-ignore
      { imageOriginalSrc: 'this-is-one.jpg' },
      // @ts-ignore
      { imageOriginalSrc: '//shopify.com/someimage.jpg' },
    ],
  };
  const expectedIndexes = [0, 0, 2];

  const { variants } = setVariantImageIndexes(product);
  const imageIndexes = variants.map((v) => v.imageIndex);
  t.deepEqual(expectedIndexes, imageIndexes);
});
