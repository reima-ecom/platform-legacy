/* eslint-disable no-console */
import cmdArticles from './articles.js';

const main = async () => {
  await cmdArticles();
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
