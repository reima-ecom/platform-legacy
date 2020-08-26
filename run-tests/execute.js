/* eslint-disable no-console */
import { spawn } from 'child_process';
import { join } from 'path';
// eslint-disable-next-line
import __dirname from './.dirname.js';

/**
 * @param {string} command
 * @param {string[]} args
 * @param {object} [options]
 * @param {boolean} [options.local]
 */
const execute = async (command, args, options = {}) => new Promise((resolve, reject) => {
  if (!options.local) {
    /* eslint-disable no-param-reassign */
    if (process.platform === 'win32') command += '.cmd';
    command = join(__dirname, 'node_modules', '.bin', command);
    /* eslint-enable no-param-reassign */
  }

  // console.log(`  running ${command} ${args.join(' ')}`);

  const cmd = spawn(command, args, { shell: true });

  cmd.stdout.on('data', (data) => {
    console.log(data.toString());
  });
  cmd.stderr.on('data', (data) => {
    console.error(data.toString());
  });
  cmd.on('error', reject);
  cmd.on('close', (code) => {
    if (code) reject(code);
    resolve();
  });
});

export default execute;
