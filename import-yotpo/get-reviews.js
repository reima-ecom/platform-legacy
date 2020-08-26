import fetch from 'node-fetch';

const getUToken = async (yotpoAppKey, yotpoSecret) => {
  if (!yotpoAppKey || !yotpoSecret) throw new Error('Please specify yotpo credentials');

  const params = {
    client_id: yotpoAppKey,
    client_secret: yotpoSecret,
    grant_type: 'client_credentials',
  };
  const response = await fetch('https://api.yotpo.com/oauth/token', {
    method: 'post',
    body: JSON.stringify(params),
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) throw new Error(`Couldn't get utoken: ${await response.text()}`);
  const data = await response.json();

  return data.access_token;
};

/**
 * @param {string} yotpoAppKey
 * @param {string} yotpoUToken
 * @param {number} [pageSize]
 */
async function* getProductsNextPage(yotpoAppKey, yotpoUToken, pageSize = 300) {
  let page = 1;
  let isNextPage = true;
  /* eslint-disable no-await-in-loop */
  while (isNextPage) {
    const url = `https://api.yotpo.com/v1/apps/${yotpoAppKey}/products?utoken=${yotpoUToken}&page=${page}&count=${pageSize}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Couldn't get products: ${await response.text()}`);
    /** @type {YotpoProductsResponse} */
    const { products, pagination } = await response.json();
    // continue if we still have pages left
    isNextPage = pagination.page * pagination.per_page < pagination.total;
    page += 1;
    yield products;
  }
  /* eslint-enable no-await-in-loop */
}

/**
 * @param {string} yotpoAppKey
 * @param {string} yotpoUToken
 */
const getProducts = async (yotpoAppKey, yotpoUToken) => {
  /** @type {YotpoProduct[]} */
  const products = [];
  for await (const productsPage of getProductsNextPage(yotpoAppKey, yotpoUToken)) {
    products.push(...productsPage);
  }
  return products;
};

/**
 * @param {string} yotpoAppKey
 * @param {string} productIdYotpo
 * @param {number} [pageSize]
 */
async function getProductReviews(yotpoAppKey, productIdYotpo, pageSize = 300) {
  const url = `https://api.yotpo.com/v1/widget/${yotpoAppKey}/products/${productIdYotpo}/reviews.json?per_page=${pageSize}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Couldn't get reviews: ${await response.text()}`);
  /** @type {YotpoProductReviewsResponse} */
  const { response: { reviews, pagination, bottomline } } = await response.json();
  if (pagination.total > pagination.per_page) {
    throw new Error(`Need to paginate reviews (id ${productIdYotpo}, total ${pagination.total}, page size ${pagination.per_page})`);
  }
  // continue if we still have pages left
  return { reviews, bottomline, productIdYotpo };
}

/**
 * @param {string} yotpoAppKey
 * @param {string} yotpoSecret
 */
const getReviews = async (yotpoAppKey, yotpoSecret) => {
  // get utoken
  const yotpoUToken = await getUToken(yotpoAppKey, yotpoSecret);
  // get products
  const products = await getProducts(yotpoAppKey, yotpoUToken);
  // loop products and get reviews if count > 0
  const getReviewPromises = products.map((product) => {
    // filter out site reviews and products with no reviews
    if (product.external_product_id === 'yotpo_site_reviews') return undefined;
    if (product.total_reviews <= 0) return undefined;

    return getProductReviews(yotpoAppKey, product.external_product_id);
  }).filter(Boolean);
  return Promise.all(getReviewPromises);
};

export default getReviews;
