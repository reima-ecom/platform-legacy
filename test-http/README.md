# HTTP status code tester

Test HTTP status codes against a site.

Usage:

```bash
yarn test-http testfile

# or run directly via node
node cmd.js testfile
```

`testfile` is a space-delimitered text file with status code, url, and optionally headers, see `tests` file for an example.