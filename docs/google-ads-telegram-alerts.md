# Google Ads Telegram alerts

## Purpose

`scripts/google-ads-telegram-alert.mjs` sends BlinkAd Google Ads campaign reports to Telegram.

It supports two alert/report rules:

- CPC alert: campaign CPC changed by at least 30% versus the previous 7-day period.
- Daily report: send all active/recent campaign performance every day at 15:00 KST.

## Data source

- Google Ads API live query
- Current period: last 7 days including today
- Comparison period: the 7 days immediately before the current period

The report includes impressions, clicks, cost, average CPC, conversions, and week-over-week changes.

## Secrets

Do not commit Telegram credentials.

The script reads Telegram values in this order:

1. Environment variables
   - `GOOGLE_ADS_TELEGRAM_BOT_TOKEN`
   - `GOOGLE_ADS_TELEGRAM_CHAT_ID`
2. macOS Keychain
   - token service: `blinkad-google-ads-telegram-bot-token`
   - chat service: `blinkad-google-ads-telegram-chat-id`
   - account: `BA_Ads_alert_bot`
3. Generic fallback environment variables
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_CHAT_ID`

Google Ads credentials are loaded from the existing shared env files:

- `.env.local`
- `.env`
- `../blinkad/.env.local`
- `../blinkad/.env`
- `../../.env`

## Commands

```bash
npm run ads:telegram:discover-chat
npm run ads:telegram:dry-run
npm run ads:telegram:test
npm run ads:telegram:daily
npm run ads:telegram:alert
```

`ads:telegram:test` sends the same daily report with a test prefix.

`ads:telegram:dry-run` prints the test report locally without sending Telegram messages.

`ads:telegram:alert` sends a message only when at least one campaign CPC changed by 30% or more.

## Daily schedule

Recommended local macOS LaunchAgent:

```bash
node scripts/google-ads-telegram-alert.mjs --daily
```

Schedule time:

- Hour: `15`
- Minute: `0`
- Time zone: local machine time, expected KST on this Mac

## Notes

- If `discover-chat` returns no chat, send `/start` to the Telegram bot first and retry.
- Telegram messages are split into multiple chunks when the report exceeds Telegram's message length limit.
- Campaigns included in the report are campaigns that are currently `ENABLED` or had impressions/clicks/cost in the current or previous 7-day period.
