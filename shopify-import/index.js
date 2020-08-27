#!/usr/bin/env node
/* eslint-disable no-restricted-syntax */
import {
  getCache, getContentWriter, setResourcesToLocalSrc, mapPipe, getResourceDownloader,
} from '@reima-ecom/lib';
import { getProductsJsonlStream, cancelCurrentBulkOperation } from './lib/import.js';
import {
  getProductMapper, imagesToResources, productsJsonlToArray,
} from './lib/shopify-transform.js';
import setVariantImageIndexes from './lib/variant-images.js';

const usage = `
Download and write Shopify products.

Usage: yarn shopify-import [command] [product content dir]

Where command is one of 'get-products', 'write-products', 'dl-images', 'cancel-bulk'
and product content dir is the root content dir.
`;

const CACHE_DIR = './.cache/shopify';
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

const main = async () => {
  const [,, command, contentDir] = process.argv;

  const writeContent = getContentWriter(contentDir);
  const downloadResources = getResourceDownloader(contentDir);

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

  switch (command) {
    case 'get-products':
      return cmdGetProducts();
    case 'write-products':
      return cmdWriteProducts();
    case 'dl-images':
      return cmdDlImages();
    case 'get-collections':
      throw new Error('Not implemented');
    case 'write-collections':
      throw new Error('Not implemented');
    case 'cancel-bulk':
      return cancelCurrentBulkOperation();
    default:
      throw new Error('Not implemented');
  }
};

// eslint-disable-next-line no-console
main().catch((err) => {
  console.error(err);
  console.log(usage);
  process.exit(1);
});
