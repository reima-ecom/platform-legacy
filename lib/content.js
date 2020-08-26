import { promises as fs } from 'fs';
import { dirname, join } from 'path';
import YAML from 'yaml';

const file = (frontmatter, body = '', frontmatterFormat) => {
  switch (frontmatterFormat) {
    case 'yaml':
      return `---\n${YAML.stringify(frontmatter)}\n---\n${body}`;
    default:
      return `---\n${JSON.stringify(frontmatter, null, 2)}\n---\n${body}`;
  }
};

const writeFile = async (filePath, frontmatter, body, frontmatterFormat) => {
  const contents = file(frontmatter, body, frontmatterFormat);
  await fs.mkdir(dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, contents, { flag: 'w' });
};

/**
 * @param {string} CONTENT_DIR
 * @param {'json'|'yaml'} [frontmatterFormat]
 */
export const getContentWriter = (CONTENT_DIR, frontmatterFormat) =>
  // eslint-disable-next-line implicit-arrow-linebreak
  async (filePathSegments, frontmatter, body) => {
    const filePath = join(CONTENT_DIR, ...filePathSegments);
    await writeFile(filePath, frontmatter, body, frontmatterFormat);
  };

export const getFrontmatterAppender = (CONTENT_DIR) => async (filePathSegments, frontmatter) => {
  const filePath = join(CONTENT_DIR, ...filePathSegments);
  const contents = await fs.readFile(filePath);
  const [, json, body] = contents.toString().split('---\n');
  const newFrontmatter = {
    ...JSON.parse(json),
    ...frontmatter,
  };
  await writeFile(filePath, newFrontmatter, body);
};

export default getContentWriter;
