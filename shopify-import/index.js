#!/usr/bin/env node
/* eslint-disable no-restricted-syntax */
import {
  getCache, getContentWriter, setResourcesToLocalSrc, mapPipe, getResourceDownloader,
} from '@reima-ecom/lib';
import { getProductsJsonlStream, getCollectionsJsonlStream, cancelCurrentBulkOperation } from './lib/import.js';
import {
  getProductMapper, imagesToResources, getType, productsJsonlToArray,
} from './lib/shopify-transform.js';
import setVariantImageIndexes from './lib/variant-images.js';

const CACHE_DIR = './.cache/shopify';
const CONTENT_DIR = './products';
const mapProduct = getProductMapper([
  'Breathability',
  'Waterproof',
  'Durability',
  'Warmth',
  'UV-Protection',
  'SizeClothing',
  'SizeHand',
  'SizeFeet',
  'SizeHeadwear',
  'Color',
  'Gender',
]);

const cache = getCache(CACHE_DIR);
const writeContent = getContentWriter(CONTENT_DIR);
const downloadResources = getResourceDownloader(CONTENT_DIR);

const writeProduct = async (product) => {
  const { descriptionHtml, ...p } = product;
  await writeContent(
    ['products', product.handle, 'index.html'],
    p, product.descriptionHtml,
  );
  return product;
};

const cmdGetProducts = async () => {
  const productsStream = await getProductsJsonlStream();
  return cache.writeStream('products-shopify.jsonl', productsStream);
};

const cmdWriteProducts = async () => {
  const products = await productsJsonlToArray(cache.readLines('products-shopify.jsonl'));
  await cache.write('products-shopify.json', products);
  const pipe = mapPipe(
    mapProduct,
    imagesToResources,
    setResourcesToLocalSrc,
    setVariantImageIndexes,
    writeProduct,
  );
  return pipe(products);
};

const cmdDlImages = async () => {
  const products = await cache.read('products-shopify.json');
  const pipe = mapPipe(
    mapProduct,
    imagesToResources,
  );
  const mappedProducts = await pipe(products);
  const toDownload = mappedProducts.reduce((array, product) => {
    if (!product.resources) return array;
    const pathSegments = ['products', product.handle];
    const objects = product.resources.map((r) => ({ pathSegments, src: r.src }));
    return array.concat(objects);
  }, []);
  return downloadResources(toDownload);
};

const cmdGetCollections = async () => {
  const collectionsStream = await getCollectionsJsonlStream();
  return cache.writeStream('collections-shopify.jsonl', collectionsStream);
};

const cmdWriteCollections = async () => {
  /** @type {Promise[]} */
  const writePromises = [];
  const collectionHandles = {};
  let productWeight = 0;
  for await (const line of cache.readLines('collections-shopify.jsonl')) {
    const obj = JSON.parse(line);
    // eslint-disable-next-line no-continue
    if (obj.publishedOnCurrentPublication === false) continue;
    const type = getType(obj.id);
    if (type === 'collection') {
      const {
        descriptionHtml, title, handle, id, seo,
      } = obj;
      collectionHandles[id] = handle;
      writePromises.push(writeContent(
        ['collections', handle, '_index.html'],
        { title, seotitle: seo.title, description: seo.description },
        descriptionHtml,
      ));
    } else if (type === 'product') {
      productWeight += 1;
      const { handle, __parentId: collectionId, seo: { description } } = obj;
      const collectionHandle = collectionHandles[collectionId];
      // if we don't find the handle, it means this collection is not published
      // eslint-disable-next-line no-continue
      if (!collectionHandle) continue;
      writePromises.push(writeContent(
        ['collections', collectionHandle, 'products', `${handle}.md`],
        {
          type: 'products',
          weight: productWeight,
          noindex: true,
          description,
        },
      ));
    }
  }
  await Promise.all(writePromises);
};

const main = async () => {
  const [,, command] = process.argv;

  switch (command) {
    case 'get-products':
      return cmdGetProducts();
    case 'write-products':
      return cmdWriteProducts();
    case 'dl-images':
      return cmdDlImages();
    case 'get-collections':
      return cmdGetCollections();
    case 'write-collections':
      return cmdWriteCollections();
    case 'cancel-bulk':
      return cancelCurrentBulkOperation();
    default:
      await cmdGetProducts();
      await cmdWriteProducts();
      await cmdDlImages();
      await cmdGetCollections();
      await cmdWriteCollections();
      return undefined;
  }
};

// eslint-disable-next-line no-console
main().catch((err) => {
  console.error(err);
  process.exit(1);
});
