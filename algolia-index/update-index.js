const algoliasearch = require('algoliasearch');

/** @type {import('algoliasearch').SearchClient} */
// @ts-ignore
const client = algoliasearch('6FDKJXBLR9', process.env.ALGOLIA_ADMIN_KEY);

// @ts-ignore
// eslint-disable-next-line import/no-unresolved
const objects = require('../../www/us/public/algolia.json');

const index = client.initIndex('reima-us-dev');

index.replaceAllObjects(objects).then(() => {
  console.log('Updated algolia index');
}).catch((error) => {
  console.error('Could not update index', error);
  process.exit(1);
});
