import contentful from 'contentful';
import { getContentWriter, getImageDownloader } from '@reima-solution-sales/lib';

const CONTENTFUL_TOKEN = process.env.CONTENTFUL_TOKEN_WORLD;
if (!CONTENTFUL_TOKEN) throw new Error('Need contentful access token CONTENTFUL_TOKEN_WORLD');
const CONTENTFUL_SPACE = '86bcuchr2qmp';
const CONTENT_DIR = 'content';

/**
 * @param {import('contentful').Entry} blockEntry
 */
const mapSections = (blockEntry) => ({
  template: blockEntry.sys.contentType.sys.id,
  image: blockEntry.fields.image
      && blockEntry.fields.image.fields.file.fileName,
  imageCaption: blockEntry.fields.imageCaption,
  body: blockEntry.fields.body,
});

/**
 * @param {any[]} array
 * @param {import('contentful').Entry} blockEntry
 */
const reduceSectionImages = (array, blockEntry) => {
  const { image } = blockEntry.fields;
  if (!image) return array;
  return ([
    ...array,
    {
      name: image.fields.file.fileName,
      src: image.fields.file.url,
    },
  ]);
};

/**
 * @param {string} categoryName
 * @returns {string}
 */
const slugify = (categoryName) => categoryName.toLowerCase().replace(' ', '-');

/**
 * @param {CFArticleEntry} articleEntry
 * @returns {Article}
 */
const mapArticles = (articleEntry) => {
  const hasHero = articleEntry.fields.image && true;
  const sections = articleEntry.fields.blocks;
  return ({
    slug: articleEntry.fields.slug.trim(),
    category: articleEntry.fields.category,
    categorySlug: articleEntry.fields.category
      && slugify(articleEntry.fields.category),
    title: articleEntry.fields.title,
    author: articleEntry.fields.author,
    summary: articleEntry.fields.summary,
    date: `${articleEntry.fields.date}:00`,
    body: articleEntry.fields.body,
    sections: sections && sections.map(mapSections),
    hero: hasHero && [{
      image: 'image',
      heading: articleEntry.fields.title,
    }],
    resources: [
      ...(articleEntry.fields.image
        ? [{
          name: 'image',
          src: articleEntry.fields.image.fields.file.url,
        }]
        : []),
      ...(sections
        ? sections.reduce(reduceSectionImages, [])
        : []),
    ],
  });
};

/**
 * @param {Article[]} articles
 * @returns {{ title: string, slug: string }[]}
 */
const getCategories = (articles) => {
  const categoriesDuplicates = articles.map((a) => a.category);
  const categories = [...new Set(categoriesDuplicates)];
  return categories.map((cat) => ({
    title: cat,
    slug: slugify(cat),
  }));
};

/**
 * @param {import('contentful').ContentfulClientApi} client
 * @returns {Promise<Article[]>}
 */
const getArticles = async (client) => {
  /** @type {import('contentful').EntryCollection<CFArticleEntry>} */
  const articleEntries = await client.getEntries({
    content_type: 'article',
  });
  const articles = articleEntries.items.map(mapArticles);
  return articles;
};

const client = contentful.createClient({
  space: CONTENTFUL_SPACE,
  accessToken: CONTENTFUL_TOKEN,
});
const write = getContentWriter(CONTENT_DIR);
const downloadResources = getImageDownloader(CONTENT_DIR);

const cmdArticles = async () => {
  const articles = await getArticles(client);

  // write blog category index pages
  await Promise.all(getCategories(articles).map((category) => write(
    ['blogs', category.slug, '_index.md'], category,
  )));

  const articlesWithResources = await Promise.all(articles.map(async (article) => {
    const downloaded = await downloadResources({
      pathSegments: ['blogs', article.categorySlug, article.slug],
      resources: article.resources,
    });
    return { ...article, resources: downloaded.resources };
  }));
  await Promise.all(articlesWithResources.map(async (article) => {
    const {
      slug,
      body,
      categorySlug,
      ...frontmatter
    } = article;
    return write(
      ['blogs', categorySlug, slug, 'index.html'],
      frontmatter,
      body,
    );
  }));
  // eslint-disable-next-line no-console
  console.log('Articles done');
};

export default cmdArticles;

/**
 * @typedef {import('contentful').Entry} CFArticleEntry
 *
 * @typedef Article
 * @property {string} title
 * @property {string} slug
 * @property {string} author
 * @property {string} [category]
 * @property {string} [categorySlug]
 * @property {string} date
 * @property {string} summary
 * @property {string} body
 * @property {string[]} [css]
 * @property {object[]} [sections]
 * @property {{image: string, heading: string}[]} [hero]
 * @property {{name: string, src: string}[]} resources
 */
