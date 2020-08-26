import { promises as fs, createWriteStream } from 'fs';
import { dirname, join } from 'path';
import fetch from 'node-fetch';
import util from 'util';
import { pipeline } from 'stream';
import { URL } from 'url';

const streamPipeline = util.promisify(pipeline);

const getValidUrl = (url) => (url.startsWith('http') ? url : `https:${url}`);

const getImageRelativePath = (url) => {
  const filename = new URL(getValidUrl(url)).pathname.split('/').pop();
  return filename;
};

const download = async (dirPath, url, filename) => {
  const httpsUrl = getValidUrl(url);
  const filePath = join(dirPath, filename || getImageRelativePath(httpsUrl));
  const response = await fetch(httpsUrl);
  if (!response.ok) throw new Error(`Could not download: ${response.statusText}`);
  await fs.mkdir(dirname(filePath), { recursive: true });
  await streamPipeline(response.body, createWriteStream(filePath));
};

export const setResourcesToLocalSrc = (frontmatter) => ({
  ...frontmatter,
  resources: frontmatter.resources.map((resource) => ({
    ...resource,
    src: getImageRelativePath(resource.src),
  })),
});

const fileExists = async (filePath) => {
  try {
    await fs.stat(filePath);
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') return false;
    throw error;
  }
};

export const getDownloader = (directory) => {
  if (!directory) throw new Error('Need directory');
  return async ({ url, filename }) => {
    if (!url) throw new Error('Need url');
    if (await fileExists(join(directory, filename))) {
      return `File "${filename}" in "${directory}" exists`;
    }
    await download(directory, url, filename);
    return `Downloaded ${directory}/${filename}`;
  };
};

export const getImageDownloader = (CONTENT_DIR) => async (frontmatter) => {
  const pathSegments = [CONTENT_DIR];
  if (frontmatter.slug) {
    pathSegments.push('pages');
    pathSegments.push(frontmatter.slug);
  }
  if (frontmatter.pathSegments) {
    pathSegments.push(...frontmatter.pathSegments);
  }
  const childDir = join(...pathSegments);
  await Promise.all(frontmatter.resources.map(
    (img) => download(childDir, img.src),
  ));
  return setResourcesToLocalSrc(frontmatter);
};

const chunk = (array, size) => {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    const currentChunk = array.slice(i, i + size);
    result.push(currentChunk);
  }
  return result;
};

export const getResourceDownloader = (CONTENT_DIR) => async (array) => {
  console.log('Downloading resources...');
  const chunked = chunk(array, 20);
  // eslint-disable-next-line no-restricted-syntax
  for (const dl of chunked) {
    // eslint-disable-next-line no-await-in-loop
    await Promise.all(dl.map(async ({ pathSegments, src }) => {
      try {
        const dir = join(CONTENT_DIR, ...pathSegments);
        await download(dir, src);
      } catch (error) {
        console.error(error);
      }
    }));
    if (process.stdout.isTTY) {
      process.stdout.write('.');
    }
  }
  console.log('');
};
