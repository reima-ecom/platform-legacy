const setVariantImageIndexes = (product) => {
  /** @type {import("./shopify-transform").Product} */
  const { images, variants } = product;
  const findImageIndex = (imageSrc) => images.findIndex((image) => image.originalSrc === imageSrc);

  return {
    ...product,
    variants: variants.map((variant) => ({
      ...variant,
      imageIndex: findImageIndex(variant.imageOriginalSrc),
    })),
  };
};
export default setVariantImageIndexes;
