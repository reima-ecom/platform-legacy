/* eslint-disable no-console */
/* eslint-disable no-restricted-syntax */
import fetch from 'node-fetch';

const adminQuery = async (graphQl) => {
  const resp = await fetch(`https://${process.env.SHOPIFY_SHOP}.myshopify.com/admin/api/2020-01/graphql.json`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Basic ${process.env.SHOPIFY_BASIC_AUTH}`,
    },
    method: 'POST',
    body: JSON.stringify({ query: graphQl }),
  });
  if (!resp.ok) throw new Error(`Could not query: ${resp.statusText}`);
  const { data, errors } = await resp.json();
  if (errors) {
    console.error(errors);
    throw new Error('Errors encountered - see above');
  }
  return data;
};

/**
 * @param {string} queryGQL
 * @returns {Promise<{id: string, status: string}>}
 */
const bulkQuery = async (queryGQL) => {
  const graphQl = `
  mutation {
    bulkOperationRunQuery(
     query: """${queryGQL}"""
    ) {
      bulkOperation {
        id
        status
      }
      userErrors {
        field
        message
      }
    }
  }`;
  const data = await adminQuery(graphQl);
  const errors = data.bulkOperationRunQuery.userErrors;
  if (errors.length) {
    console.error(errors);
    throw new Error('Could not create bulk query');
  }
  return data.bulkOperationRunQuery.bulkOperation;
};

async function* bulkOperation() {
  const graphQl = `
    {
      currentBulkOperation {
        id
        status
        errorCode
        objectCount
        url
      }
    }
  `;
  while (true) {
    // eslint-disable-next-line no-await-in-loop
    const { currentBulkOperation } = await adminQuery(graphQl);
    // log object and return if error
    if (currentBulkOperation.errorCode) {
      console.log('Error in bulk operation polling', currentBulkOperation);
      throw new Error();
    }
    yield currentBulkOperation;
  }
}

export const cancelCurrentBulkOperation = async () => {
  const graphQl = `
    {
      currentBulkOperation {
        id
        status
        errorCode
        objectCount
        url
      }
    }
  `;
  const { currentBulkOperation } = await adminQuery(graphQl);
  if (currentBulkOperation.errorCode) {
    console.log('Error getting current bulk operation', currentBulkOperation);
    throw new Error();
  }
  console.log('Current operation', currentBulkOperation.status);
  if (currentBulkOperation.status === 'RUNNING') {
    const smth = await adminQuery(`
      mutation {
        bulkOperationCancel(id: "${currentBulkOperation.id}") {
          bulkOperation {
            status
          }
          userErrors {
            field
            message
          }
        }
      }
    `);
    console.log(smth);
  }
};

const bulkOperationPollUntilComplete = async () => {
  console.log('Waiting for bulk operation...');
  for await (const op of bulkOperation()) {
    if (process.stdout.isTTY) {
      process.stdout.write('.');
    }
    if (op.status === 'COMPLETED') {
      if (process.stdout.isTTY) console.log();
      console.log(`Bulk operation ${op.status}`);
      return op;
    }
  }
  throw new Error('Unexpected error');
};

const productQuery = `
{
  products {
    edges {
      node {
        id
        handle
        title
        descriptionHtml
        tags
        onlineStoreUrl
        legacyResourceId
        publishedOnCurrentPublication
        images {
          edges {
            node {
              id
              originalSrc
            }
          }
        }
        priceRange {
          minVariantPrice { currencyCode }
        }
        collections {
          edges {
            node {
              id
              handle
            }
          }
        }
        variants {
          edges {
            node {
              id
              storefrontId
              availableForSale
              compareAtPrice
              price
              image { originalSrc }
              selectedOptions {
                name
                value
              }
            }
          }
        }
        seo {
          title
          description
        }
      }
    }
  }
}
`;

const collectionQuery = `
{
  collections {
    edges {
      node {
        id
        handle
        title
        descriptionHtml
        publishedOnCurrentPublication
        seo {
          title
          description
        }
        products {
          edges {
            product: node {
              id
              handle
              publishedOnCurrentPublication
              seo {
                title
                description
              }
            }
          }
        }
      }
    }
  }
}
`;

export const getProductsUrl = async () => {
  console.log('Getting products...');
  const createdBulkOperation = await bulkQuery(productQuery);
  console.log(`Bulk operation ${createdBulkOperation.status}`);
  const completedBulkOperation = await bulkOperationPollUntilComplete();
  console.log(`Complete at ${completedBulkOperation.url}`);
  return completedBulkOperation.url;
};

const getUrlDownloadStream = async (url) => {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error('Could not download');
  return resp.body;
};

export const getProductsJsonlStream = async () => {
  const url = await getProductsUrl();
  return getUrlDownloadStream(url);
};

/**
 * @returns {Promise<string>}
 */
export const getCollectionsUrl = async () => {
  console.log('Getting collections...');
  const createdBulkOperation = await bulkQuery(collectionQuery);
  console.log(`Bulk operation ${createdBulkOperation.status}`);
  const completedBulkOperation = await bulkOperationPollUntilComplete();
  return completedBulkOperation.url;
};

export const getCollectionsJsonlStream = async () => {
  const url = await getCollectionsUrl();
  return getUrlDownloadStream(url);
};
