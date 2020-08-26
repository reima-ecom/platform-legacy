export const mapPipe = (...fns) => async (array) => {
  let a = array;
  // eslint-disable-next-line no-restricted-syntax
  for (const fn of fns) {
    // eslint-disable-next-line no-await-in-loop
    a = await Promise.all(a.map(fn));
  }
  return a;
};

export default mapPipe;
