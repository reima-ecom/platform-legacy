# Yotpo review importer

This package imports reviews from Yotpo into content file frontmatter. This works as follows:

1. Products are fetched from Yotpo. This includes the products' legacy id in Shopify as well as number of reviews.
2. Reviews for products (with review count > 0) are fetched one product at a time. [^1]
3. A map from the legacy id used in yotpo to the product handle is created from an existing JSONL export from Shopify.
4. Review frontmatter is appended to products in the content dir.

## Arguments and inputs

Environment variables:

- `YOTPO_APP_KEY`: App key for Yotpo
- `YOTPO_SECRET`: Yotpo secret

CLI arguments:

1. Path to JSONL file with Shopify product export. [^2]
2. Path to products contents dir. [^2]

[^1]: This is needed because this is the only way to get all reviews for a product. Fetching reviews in bulk marks many reviews to the special `yotpo_site_review` sku even though they are primarily product reviews.

[^2]: These can be absolute or relative. Note that relative paths are resolved against the current working directory. That means relative paths will not work with `yarn workspace run`, because that sets the cwd to the package directory. Installing this package via yarn and running directly with `yarn reviews-yotpo` is fine.