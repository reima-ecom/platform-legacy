#!/usr/bin/env node

const algoliasearch = require('algoliasearch');

/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */

const usage = `
Update Algolia index (replacing all objects) with the contents
of the specified json file.

Usage: yarn update-algolia [app id] [index name] [json file]
Requires the ALGOLIA_ADMIN_KEY environment variable to be set.
`;

const main = async () => {
  const [,, appId, indexName, filePath] = process.argv;
  const { ALGOLIA_ADMIN_KEY } = process.env;

  /** @type {import('algoliasearch').SearchClient} */
  // @ts-ignore
  const client = algoliasearch(appId, ALGOLIA_ADMIN_KEY);

  // @ts-ignore
  const objects = require(filePath);

  const index = client.initIndex(indexName);
  await index.replaceAllObjects(objects);

  console.log('Updated algolia index');
};

main().catch((error) => {
  console.error('Could not update index', error);
  console.log(usage);
  process.exit(1);
});
