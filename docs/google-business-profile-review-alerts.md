# Google Business Profile Review Alerts

Weekly Telegram report for Google Business Profile review movement by BlinkAd ERP store.

## Schedule

- GitHub Actions workflow: `google-business-profile-review-weekly.yml`
- Run time: every Friday 18:00 KST
- UTC cron: `0 9 * * 5`
- Script: `scripts/google-business-profile-review-alert.mjs`
- History: GitHub Actions cache at `.cache/gbp-review-snapshots.json`
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

1. DataForSEO
   - `DATAFORSEO_LOGIN`
   - `DATAFORSEO_PASSWORD`
   - `GBP_REVIEW_DATA_SOURCE=dataforseo`
   - Uses Google Maps Live SERP to find the profile.
   - Uses Google Reviews sorted by newest for latest review date.
   - Store-specific matching queries are kept in `scripts/google-business-profile-review-alert.mjs`.
2. BigQuery
   - `GOOGLE_CLOUD_PROJECT`
   - `BIGQUERY_DATASET`, default `gbp_ops`
   - `BIGQUERY_LOCATION`, default `asia-northeast3`
   - `gbp_daily_metrics.review_count` is used as the profile review count.
   - `gbp_reviews.review_date` is used for the latest review date.
3. Notion
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

For DataForSEO in GitHub Actions:

- `DATAFORSEO_LOGIN`
- `DATAFORSEO_PASSWORD`

## Current Setup Note

As of 2026-07-13, DataForSEO is the active source for the 7 ERP stores. BigQuery and Notion remain as fallback paths for future first-party historical reporting.

Current DataForSEO matching note:

- `도르도뉴` is matched through the Google Maps CID from `https://maps.app.goo.gl/HugLRevvrev83HYn8`.
- DataForSEO returns current public profile values. Change columns are shown as `확인 불가` until a persistent history store is connected.
- GitHub Actions stores each successful weekly snapshot in cache. The first run has no prior comparison; later runs can compare against the latest prior snapshot on or before the previous day and previous week.
