/**
 * @typedef Product
 * @property {string} handle
 * @property {string} title
 * @property {string} seotitle
 * @property {string} descriptionHtml
 * @property {string[]} tags
 * @property {string[]} collections
 * @property {number} price
 * @property {string} priceFormatted
 * @property {number} compareAtPrice
 * @property {string} compareAtPriceFormatted
 * @property {boolean} hasPriceRange
 * @property {boolean} available
 * @property {Object<string, string[]>} filtering
 * @property {Option[]} options
 * @property {Resource[]} [resources]
 * @property {Variant[]} variants
 * @property {object[]} images
 * @property {string} description
 * @property {string} [yotpoId]
 */

/**
 * @typedef Option
 * @property {string} name
 * @property {string} firstAvailable
 * @property {OptionValue[]} values
 */

/**
 * @typedef OptionValue
 * @property {string} value
 * @property {boolean} firstAvailable
 * @property {boolean} availableInitially
 */

/**
 * @typedef Variant
 * @property {string} id
 * @property {boolean} available
 * @property {number} price
 * @property {number} compareAtPrice
 * @property {string} imageOriginalSrc
 * @property {Object<string, string>} options
 */

/**
  * @typedef Resource
  * @property {string} name
  * @property {string} src
  * @property {any} [params]
  */

const findVariant = (variants, options) => {
  const variant = variants.find((v) => {
    if (Object.keys(options).length !== v.selectedOptions.length) return false;
    return v.selectedOptions.every((opt) => options[opt.name] === opt.value);
  }) || {};
  return variant || {};
};

/**
 * @param {string[]} [filterTags]
 */
export const getProductMapper = (filterTags = []) => (
  product,
) => {
  const minPrice = product.variants.reduce(
    (prev, variant) => {
      const variantPrice = Number.parseFloat(variant.price);
      if (!prev) return variantPrice;
      if (variantPrice < prev) return variantPrice;
      return prev;
    }, 0,
  );

  const maxPrice = product.variants.reduce(
    (prev, variant) => {
      const variantPrice = Number.parseFloat(variant.price);
      if (!prev) return variantPrice;
      if (variantPrice > prev) return variantPrice;
      return prev;
    }, 0,
  );

  const compareAtPrice = product.variants.reduce(
    (maxCompareAt, variant) => {
      if (!variant.compareAtPrice) return maxCompareAt;
      const variantCompareAt = Number.parseFloat(variant.compareAtPrice);
      if (variantCompareAt > maxCompareAt) return variantCompareAt;
      return maxCompareAt;
    }, minPrice,
  );

  const filterFeatures = product.tags.reduce((obj, tag) => {
    const [tagName, tagValue] = tag.split(':');
    if (filterTags.includes(tagName)) {
      const values = obj[tagName] || [];
      if (!values.includes(tagValue)) {
        return { ...obj, [tagName]: [...values, tagValue] };
      }
    }
    return obj;
  }, {});

  const allOptionsObj = product.variants.reduce((obj, variant) => {
    let newObj = obj;
    variant.selectedOptions.forEach((opt) => {
      const allOptionValues = obj[opt.name] || [];
      if (!allOptionValues.includes(opt.value)) allOptionValues.push(opt.value);
      newObj = { ...newObj, [opt.name]: allOptionValues };
    });
    return newObj;
  }, {});
  const firstAvailableVariant = product.variants.find(
    (variant) => variant.availableForSale,
  );
  const firstAvailableVariantOptionsObj = (firstAvailableVariant
      && firstAvailableVariant.selectedOptions.reduce(
        (obj, opt) => ({ ...obj, [opt.name]: opt.value }), {},
      )) || {};
  /** @type {Option[]} */
  const options = Object.entries(allOptionsObj).map(
    ([name, values]) => ({
      name,
      firstAvailable: firstAvailableVariantOptionsObj[name],
      values: values.map((value) => ({
        value,
        firstAvailable: firstAvailableVariantOptionsObj[name] === value,
        availableInitially: findVariant(
          product.variants,
          { ...firstAvailableVariantOptionsObj, [name]: value },
        ).availableForSale,
      })),
    }),
  );

  const currency = product.priceRange.minVariantPrice.currencyCode;
  const formatted = (price) => (price
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(price)
    : null);

  const compareAtPriceIfValid = (compareAtPrice > minPrice) ? compareAtPrice : null;

  /** @type {Product} */
  const p = {
    title: product.title,
    seotitle: product.seo.title,
    tags: product.tags,
    handle: product.handle,
    descriptionHtml: product.descriptionHtml,
    collections: product.collections
      && product.collections.map(
        (collection) => collection.handle,
      ),
    price: minPrice,
    priceFormatted: formatted(minPrice),
    available: product.variants.some((v) => v.availableForSale),
    compareAtPrice: compareAtPriceIfValid,
    compareAtPriceFormatted: formatted(compareAtPriceIfValid),
    hasPriceRange: maxPrice > minPrice,
    filtering: filterFeatures,
    yotpoId: product.legacyResourceId,
    options,
    description: product.seo.description,
    images: product.images || [],
    variants: product.variants.map((variant) => {
      const imageOriginalSrc = variant.image && variant.image.originalSrc;
      // eslint-disable-next-line no-console
      if (!imageOriginalSrc) console.warn('No image found for', product.handle, variant.selectedOptions);
      return {
        id: variant.storefrontId,
        available: variant.availableForSale,
        imageOriginalSrc,
        price: Number.parseFloat(variant.price),
        priceFormatted: formatted(variant.price),
        compareAtPrice: variant.compareAtPrice
          && Number.parseFloat(variant.compareAtPrice),
        compareAtPriceFormatted: variant.compareAtPrice
          && formatted(variant.compareAtPrice),
        options: variant.selectedOptions.reduce((obj, opt) => ({
          ...obj,
          [opt.name]: opt.value,
        }), {}),
      };
    }),
  };
  return p;
};

/**
 * @param {Product} product
 */
export const imagesToResources = (product) => {
  const resources = product.images ? product.images.map((img, i) => ({
    name: i.toString().padStart(2, '0'),
    src: img.originalSrc,
  })) : [];
  return { ...product, resources };
};

/**
 * @param {string} id
 * @returns {string}
 */
export const getType = (id) => {
  if (!id) return 'unknown';
  if (id.includes('/Collection/')) return 'collection';
  if (id.includes('/Product/')) return 'product';
  if (id.includes('/ProductVariant/')) return 'variant';
  if (id.includes('/ProductImage/')) return 'image';
  if (id.includes('/Image/')) return 'image';
  return 'unknown';
};

/**
 * @param {import('readline').Interface} readlineInterface
 */
export const productsJsonlToArray = async (readlineInterface) => {
  const products = {};
  for await (const line of readlineInterface) {
    const obj = JSON.parse(line);
    // here we filter out products that aren't published on the current sales channel
    if (obj.publishedOnCurrentPublication === false) {
      console.log('Not published', obj.handle);
      // eslint-disable-next-line no-continue
      continue;
    }

    const type = getType(obj.id);
    if (type === 'product') {
      products[obj.id] = obj;
    } else {
      const { id, __parentId: parent, ...rest } = obj;
      const product = products[parent];
      // if we don't have a parent product, it is not published, so continue
      // eslint-disable-next-line no-continue
      if (!product) continue;

      const propName = `${type}s`;
      if (!product[propName]) product[propName] = [];
      product[propName].push(rest);
    }
  }
  return Object.values(products);
};
