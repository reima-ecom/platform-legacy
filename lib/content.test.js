import test from 'ava';
import { promises as fs } from 'fs';
import { getFrontmatterAppender } from './content.js';

const expected = `---
{
  "title": "Aimo",
  "var": true
}
---
Content`;

test('Frontmatter appender works', async (t) => {
  const append = getFrontmatterAppender('./test');
  await fs.copyFile('./test/aimo/index.html', './test/aimo/index.copy.html');

  await append(['aimo', 'index.copy.html'], { var: true });

  try {
    const contents = await fs.readFile('./test/aimo/index.copy.html');
    t.is(contents.toString(), expected);
  } finally {
    await fs.unlink('./test/aimo/index.copy.html');
  }
});
