import { getCache, getFrontmatterAppender } from '@reima-solution-sales/lib';
import { dirname, basename } from 'path';
import getReviews from './get-reviews.js';
import mapProductIdsToHandles from './id-to-handle-map.js';

/**
 * @param {YotpoProductReview} review
 * @returns {any}
 */
const mapYotpoReview = (review) => ({
  name: review.user.display_name,
  score: review.score,
  verified: review.verified_buyer,
  title: review.title,
  content: review.content,
  created_at: review.created_at,
});

/**
 * @param {YotpoProductBottomline} bottomline
 */
const mapBottomline = (bottomline) => ({
  average: bottomline.average_score,
  count: bottomline.total_review,
});

/**
 * @param {string} yotpoAppKey
 * @param {string} yotpoSecret
 * @param {string} productsJsonl
 * @param {string} productsDir
 */
const cmd = async (yotpoAppKey, yotpoSecret, productsJsonl, productsDir) => {
  if (!yotpoAppKey || !yotpoSecret) throw new Error('Need yotpo credentials');
  if (!productsJsonl || !productsDir) throw new Error('Need products export and content dir');
  // get reviews array
  const reviews = await getReviews(yotpoAppKey, yotpoSecret);
  // get legacy id to handle map
  const cacheDir = dirname(productsJsonl);
  const filename = basename(productsJsonl);
  const cache = getCache(cacheDir);
  const idToHandleMap = await mapProductIdsToHandles(cache.readLines(filename));
  // update products
  const appendFrontmatter = getFrontmatterAppender(productsDir);
  await Promise.all(reviews.map((review) => {
    const handle = idToHandleMap[review.productIdYotpo];
    if (!handle) {
      console.log(`Could not find handle for product with sku ${review.productIdYotpo}`);
      return undefined;
    }
    return appendFrontmatter([handle, 'index.html'], {
      reviews: review.reviews.map(mapYotpoReview),
      reviewsBottomline: mapBottomline(review.bottomline),
    });
  }));
};

export default cmd;
