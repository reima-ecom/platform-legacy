#!/usr/bin/env node
/* eslint-disable no-console */
import cmdArticles from './articles.js';

const usage = `
Output Reima world articles (i.e. blog content) to a
\`blogs\` directory inside the specified content directory.

Usage: yarn import-reima-world [content directory]
`;

const main = async () => {
  const [,, contentDir] = process.argv;
  if (!contentDir) throw new Error('Content directory not specified');
  await cmdArticles(contentDir);
};

main().catch((err) => {
  console.error(err);
  console.log(usage);
  process.exit(1);
});
