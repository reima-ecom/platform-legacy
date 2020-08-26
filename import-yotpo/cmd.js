#!/usr/bin/env node
/* eslint-disable no-console */

import cmd from './index.js';

const { YOTPO_APP_KEY, YOTPO_SECRET } = process.env;
const [,, PRODUCTS_SHOPIFY, PRODUCTS_CONTENT_DIR] = process.argv;

cmd(
  YOTPO_APP_KEY,
  YOTPO_SECRET,
  PRODUCTS_SHOPIFY,
  PRODUCTS_CONTENT_DIR,
).catch(console.error);
