#!/usr/bin/env node

import testFromFile from './index.js';

/* eslint-disable no-console */

const [,, testFile] = process.argv;

testFromFile(testFile);
