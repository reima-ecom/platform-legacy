/* eslint-disable no-console */
/* eslint-disable no-restricted-syntax */
import fetch from 'node-fetch';
import assert from 'assert';
import { createReadStream } from 'fs';
import { createInterface } from 'readline';

/**
 * @param {string} url
 * @param {number} status
 * @param {string[][]} [headers]
 */
const test = async (url, status, headers) => {
  if (!url || !status) throw new Error('Need url and status code');

  const response = await fetch(url, { redirect: 'manual' });
  assert.equal(response.status, status, `${url} status check failed`);

  if (headers) {
    for (const header of headers) {
      const [name, value] = header;
      assert.equal(response.headers.get(name), value, `${url} header ${name} check failed`);
    }
  }

  return 'Ok!';
};

const testFromFile = (filepath) => {
  const fileStream = createReadStream(filepath);
  const rl = createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });
  rl.on('line', (line) => {
    const [status, url, headers] = line.split(' ');
    const headersArray = headers && headers.split(' ').map((header) => header.split(/:(.+)/, 2));
    test(url, parseInt(status, 10), headersArray)
      .then((msg) => {
        console.log(`${msg} (${line})`);
      })
      .catch((err) => {
        console.error(err);
        process.exit(1);
      });
  });
};

export default testFromFile;
