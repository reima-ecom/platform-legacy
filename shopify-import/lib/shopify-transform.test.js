import test from 'ava';
import shopifyProduct from './shopify-product.json';
import { getProductMapper } from './shopify-transform.js';

const mapProduct = getProductMapper();

const emptyProduct = {
  variants: [],
  priceRange: { minVariantPrice: {}, maxVariantPrice: {} },
  tags: [],
  images: [],
  seo: {},
};

test.skip('product gets handle, title, html, tags', (t) => {
  const p = mapProduct(shopifyProduct);
  t.is(p.handle, shopifyProduct.handle);
  t.is(p.title, shopifyProduct.title);
  t.is(p.descriptionHtml, shopifyProduct.descriptionHtml);
  t.deepEqual(p.tags, shopifyProduct.tags);
});

test.skip('product gets prices', (t) => {
  const p = mapProduct(shopifyProduct);
  t.is(p.price, 19.95);
  t.is(p.compareAtPrice, 24.95);
});

test.skip('product gets price range boolean', (t) => {
  let p = mapProduct({
    // @ts-ignore
    product: {
      ...emptyProduct,
      priceRange: {
        minVariantPrice: { amount: '10' },
        maxVariantPrice: { amount: '10' },
      },
    },
  });
  t.is(p.hasPriceRange, false);
  p = mapProduct({
    // @ts-ignore
    product: {
      ...emptyProduct,
      priceRange: {
        minVariantPrice: { amount: '10' },
        maxVariantPrice: { amount: '11' },
      },
    },
  });
  t.is(p.hasPriceRange, true);
});

test.skip('product gets filtering from tags', (t) => {
  const p = getProductMapper([
    'SizeHeadwear',
    'Color',
  ])(
    shopifyProduct,
  );
  t.deepEqual(p.filtering, {
    Color: ['Black', 'Grey', 'Orange'],
    SizeHeadwear: ['48/50', '52/54', '56/58'],
  });
});

test.skip('product gets yotpo id (legacy id)', (t) => {
  const p = mapProduct(shopifyProduct);
  t.is(p.yotpoId, '1586955943991');
});

test.skip('product gets variants', (t) => {
  const p = mapProduct(shopifyProduct);
  const variants = [
    {
      id: 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0VmFyaWFudC8xNDExMTk3NzM0MDk4Mw==',
      available: false,
      price: 19.95,
      imageOriginalSrc: 'https://cdn.shopify.com/s/files/1/0074/4393/9383/products/melange-grey-beanie-hattara-front_ab9d5f9f-4695-448b-9736-2ad373feb6ab.jpg?v=1576183294',
      compareAtPrice: 24.95,
      options: {
        Color: 'Melange grey',
        Size: '48/50',
      },
    },
    {
      id: 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0VmFyaWFudC8xNDExMTk3NzM3Mzc1MQ==',
      available: true,
      price: 19.95,
      imageOriginalSrc: 'https://cdn.shopify.com/s/files/1/0074/4393/9383/products/melange-grey-beanie-hattara-front_ab9d5f9f-4695-448b-9736-2ad373feb6ab.jpg?v=1576183294',
      compareAtPrice: 24.95,
      options: {
        Color: 'Melange grey',
        Size: '52/54',
      },
    },
    {
      id: 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0VmFyaWFudC8xNDExMTk3NzQwNjUxOQ==',
      available: true,
      price: 19.95,
      imageOriginalSrc: 'https://cdn.shopify.com/s/files/1/0074/4393/9383/products/melange-grey-beanie-hattara-front_ab9d5f9f-4695-448b-9736-2ad373feb6ab.jpg?v=1576183294',
      compareAtPrice: 24.95,
      options: {
        Color: 'Melange grey',
        Size: '56/58',
      },
    },
    {
      id: 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0VmFyaWFudC8xNDExMTk3NzI0MjY3OQ==',
      available: true,
      price: 19.95,
      imageOriginalSrc: 'https://cdn.shopify.com/s/files/1/0074/4393/9383/products/bright-salmon-beanie-hattara-front_93241cf8-02ec-4f1e-b275-222c78e2915f.jpg?v=1576183294',
      compareAtPrice: 24.95,
      options: {
        Color: 'Bright salmon',
        Size: '48/50',
      },
    },
    {
      id: 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0VmFyaWFudC8xNDExMTk3NzI3NTQ0Nw==',
      available: true,
      price: 19.95,
      imageOriginalSrc: 'https://cdn.shopify.com/s/files/1/0074/4393/9383/products/bright-salmon-beanie-hattara-front_93241cf8-02ec-4f1e-b275-222c78e2915f.jpg?v=1576183294',
      compareAtPrice: 24.95,
      options: {
        Color: 'Bright salmon',
        Size: '52/54',
      },
    },
    {
      id: 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0VmFyaWFudC8xNDExMTk3NzMwODIxNQ==',
      available: true,
      price: 19.95,
      imageOriginalSrc: 'https://cdn.shopify.com/s/files/1/0074/4393/9383/products/bright-salmon-beanie-hattara-front_93241cf8-02ec-4f1e-b275-222c78e2915f.jpg?v=1576183294',
      compareAtPrice: 24.95,
      options: {
        Color: 'Bright salmon',
        Size: '56/58',
      },
    },
    {
      id: 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0VmFyaWFudC8xNDExMTk3NzQzOTI4Nw==',
      available: false,
      price: 19.95,
      imageOriginalSrc: 'https://cdn.shopify.com/s/files/1/0074/4393/9383/products/black-beanie-hattara-front.jpg?v=1566378231',
      compareAtPrice: 24.95,
      options: {
        Color: 'Black',
        Size: '48/50',
      },
    },
    {
      id: 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0VmFyaWFudC8xNDExMTk3NzQ3MjA1NQ==',
      available: true,
      price: 19.95,
      imageOriginalSrc: 'https://cdn.shopify.com/s/files/1/0074/4393/9383/products/black-beanie-hattara-front.jpg?v=1566378231',
      compareAtPrice: 24.95,
      options: {
        Color: 'Black',
        Size: '52/54',
      },
    },
    {
      id: 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0VmFyaWFudC8xNDExMTk3NzUwNDgyMw==',
      available: true,
      price: 19.95,
      imageOriginalSrc: 'https://cdn.shopify.com/s/files/1/0074/4393/9383/products/black-beanie-hattara-front.jpg?v=1566378231',
      compareAtPrice: 24.95,
      options: {
        Color: 'Black',
        Size: '56/58',
      },
    },
  ];
  t.deepEqual(p.variants, variants);
});

const emptyVariant = {
  id: '',
  priceV2: { amount: '' },
  compareAtPriceV2: { amount: '' },
  image: { originalSrc: '' },
};

test.skip('product gets options', (t) => {
  /** @type {typeof import('./shopify-product.json')} */
  const input = {
    ...emptyProduct,
    // @ts-ignore
    variants: [
      { ...emptyVariant, availableForSale: false, selectedOptions: [{ name: 'color', value: 'black' }, { name: 'size', value: '1' }] },
      { ...emptyVariant, availableForSale: true, selectedOptions: [{ name: 'color', value: 'black' }, { name: 'size', value: '2' }] },
      { ...emptyVariant, availableForSale: true, selectedOptions: [{ name: 'color', value: 'blue' }, { name: 'size', value: '1' }] },
      { ...emptyVariant, availableForSale: false, selectedOptions: [{ name: 'color', value: 'blue' }, { name: 'size', value: '2' }] },
      { ...emptyVariant, availableForSale: true, selectedOptions: [{ name: 'color', value: 'black' }, { name: 'size', value: '3' }] },
    ],
  };
  /** @type {import('./shopify-transform').Option[]} */
  const expectedOptions = [
    {
      name: 'color',
      firstAvailable: 'black',
      values: [
        { value: 'black', firstAvailable: true, availableInitially: true },
        { value: 'blue', firstAvailable: false, availableInitially: false },
      ],
    },
    {
      name: 'size',
      firstAvailable: '2',
      values: [
        { value: '1', firstAvailable: false, availableInitially: false },
        { value: '2', firstAvailable: true, availableInitially: true },
        { value: '3', firstAvailable: false, availableInitially: true },
      ],
    },
  ];

  // @ts-ignore
  const p = mapProduct(input);
  t.deepEqual(p.options, expectedOptions);
});
