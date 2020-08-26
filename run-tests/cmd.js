#!/usr/bin/env node

/* eslint-disable no-console */

import execute from './execute.js';

/**
 * @param {string[]} args
 */
const main = async (args) => {
  console.log('Linting...');
  await execute('eslint', ['.']);
  console.log('Ok!');

  console.log('Type checking...');
  await execute('tsc', ['-p', 'jsconfig.json']);
  console.log('Ok!');

  if (!args.includes('--no-unit')) {
    console.log('Running unit tests...');
    await execute('ava', [], { local: true });
    console.log('Ok!');
  } else {
    console.log('WARNING: Skipping unit tests!');
  }
};

const [,, ...args] = process.argv;
main(args).catch(process.exit);
