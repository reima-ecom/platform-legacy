import { promises as fs, createWriteStream, createReadStream } from 'fs';
import { createInterface } from 'readline';
import { promisify } from 'util';
import { pipeline } from 'stream';
import { join } from 'path';

const streamPipeline = promisify(pipeline);

/**
 * @param {string} CACHE_DIR
 */
const getCache = (CACHE_DIR) => ({
  /**
    * @param {string} filename
    * @param {any} object
    */
  write: async (filename, object) => {
    await fs.mkdir(CACHE_DIR, { recursive: true });
    await fs.writeFile(join(CACHE_DIR, filename), JSON.stringify(object, null, 2), { flag: 'w' });
  },
  /**
     * @param {string} filename
     */
  read: async (filename) => {
    const file = await fs.readFile(join(CACHE_DIR, filename));
    return JSON.parse(file.toString());
  },
  /**
     * @param {string} filename
     * @param {NodeJS.ReadableStream} stream
     */
  writeStream: async (filename, stream) => {
    await fs.mkdir(CACHE_DIR, { recursive: true });
    const filePath = join(CACHE_DIR, filename);
    await streamPipeline(stream, createWriteStream(filePath));
  },
  /**
     * @param {string} filename
     */
  readLines: (filename) => {
    const fileStream = createReadStream(join(CACHE_DIR, filename));
    return createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });
  },
});
export default getCache;
