/**
 * @param {import('readline').Interface} readlineInterface
 * @returns {Promise<{[id: string]: string}>}
 */
const mapProductIdsToHandles = async (readlineInterface) => {
  /** @type {{[id: string]: string}} */
  const products = {};

  for await (const line of readlineInterface) {
    const entity = JSON.parse(line);
    // see if this is a product
    if (entity.id.includes('/Product/')) {
      products[entity.legacyResourceId] = entity.handle;
    }
  }

  return products;
};

export default mapProductIdsToHandles;
