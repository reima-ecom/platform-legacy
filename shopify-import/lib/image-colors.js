import { basename } from 'path';

const setImageColors = (product) => {
  /** @type {import("./shopify-transform").Product} */
  const { options, resources } = product;
  // get colors option object
  const colorsOpt = options.find((opt) => opt.name === 'Color');
  if (!colorsOpt) return product;

  const colors = colorsOpt.values
    // get colors sorted by length (most specific first)
    .sort((a, b) => b.value.length - a.value.length)
    // make color handle lower case and hyphened
    .map((val) => ({ ...val, handle: val.value.toLowerCase().replace(/ /g, '-') }));

  // map resources
  const resourcesWithColors = resources.map((resource) => {
    // loop through colors to see if filename starts with a handle
    const color = colors.find((c) => basename(resource.src).startsWith(c.handle));
    if (!color) return resource;
    // set color on params
    return {
      ...resource,
      params: {
        ...resource.params,
        Color: color.value,
      },
    };
  });

  return {
    ...product,
    resources: resourcesWithColors,
  };
};
export default setImageColors;
