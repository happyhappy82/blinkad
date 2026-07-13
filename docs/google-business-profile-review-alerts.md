# Google Business Profile Review Alerts

Weekly Telegram report for Google Business Profile review movement by BlinkAd ERP store.

## Schedule

- GitHub Actions workflow: `google-business-profile-review-weekly.yml`
- Run time: every Friday 18:00 KST
- UTC cron: `0 9 * * 5`
- Script: `scripts/google-business-profile-review-alert.mjs`
- npm commands:
  - `npm run gbp:reviews:weekly`
  - `npm run gbp:reviews:test`
  - `npm run gbp:reviews:dry-run`

## Report Format

The Telegram message uses `sendRichMessage` first and falls back to plain text if rich messages are not supported.

Each ERP store is shown as a compact table:

- Review count
- Change versus previous available day
- Change versus previous available week
- Latest review date
- Warning section for missing data or review decreases

## Data Sources

The script tries sources in this order when `GBP_REVIEW_DATA_SOURCE=auto`.

1. BigQuery
   - `GOOGLE_CLOUD_PROJECT`
   - `BIGQUERY_DATASET`, default `gbp_ops`
   - `BIGQUERY_LOCATION`, default `asia-northeast3`
   - `gbp_daily_metrics.review_count` is used as the profile review count.
   - `gbp_reviews.review_date` is used for the latest review date.
2. Notion
   - `GBP_REVIEW_METRICS_DATABASE_ID`, or `NOTION_GBP_MINIMAL_DAILY_METRICS_DB_ID`, or `NOTION_GBP_DAILY_SUMMARY_DB_ID`
   - Required columns: store name, date, review count
   - Optional column: latest review date

## Required GitHub Secrets

The workflow reuses the Google Ads Telegram bot secrets:

- `GOOGLE_ADS_TELEGRAM_BOT_TOKEN`
- `GOOGLE_ADS_TELEGRAM_CHAT_ID`

For Notion fallback:

- `NOTION_API_KEY`
- `NOTION_GBP_MINIMAL_DAILY_METRICS_DB_ID`
- `NOTION_GBP_DAILY_SUMMARY_DB_ID`
- `NOTION_GBP_MINIMAL_STORE_DB_ID`
- `NOTION_GBP_STORE_DB_ID`

For BigQuery in GitHub Actions:

- `GCP_SERVICE_ACCOUNT_KEY`

## Current Setup Note

As of 2026-07-13, the script is ready but live ERP review reporting is blocked by data-source access:

- BigQuery `gbp_ops` currently contains only the pilot store `김밥천국 명동점`, not the 7 ERP stores.
- The available Notion integration cannot access `NOTION_GBP_MINIMAL_DAILY_METRICS_DB_ID`.
- The accessible Notion daily summary DB does not contain a review-count column.
- The existing Google API key is blocked for Google Places API.

To make the weekly report send real review data, connect one of these:

1. Add the 7 ERP stores to the GBP BigQuery pipeline and populate `gbp_daily_metrics.review_count` plus `gbp_reviews.review_date`.
2. Share the Notion review metrics DB with the `SEO블로그(에이정,테크 등)` integration and include review count/latest review date columns.
3. Provide a Google Places API-enabled key and store place IDs, then add a Places source to the script.
