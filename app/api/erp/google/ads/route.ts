import { BigQuery } from '@google-cloud/bigquery'
import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

type AdsSummary = {
  rowCount: number
  impressions: number
  clicks: number
  costMicros: number
  localActionDirectionRequests: number
  localActionCalls: number
  localActionWebsiteClicks: number
  localActions: number
}

function loadSharedEnv() {
  const envPaths = [
    path.resolve(process.cwd(), '.env.local'),
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), '../..', '.env'),
  ]

  envPaths.forEach((envPath) => {
    if (!fs.existsSync(envPath)) return

    fs.readFileSync(envPath, 'utf-8')
      .split('\n')
      .forEach((rawLine) => {
        const line = rawLine.trim()
        if (!line || line.startsWith('#') || !line.includes('=')) return
        const [rawKey, ...valueParts] = line.split('=')
        const key = rawKey.trim()
        if (!key || process.env[key]) return
        process.env[key] = valueParts.join('=').trim()
      })
  })
}

function safeIdentifier(value: string, pattern: RegExp) {
  return pattern.test(value) ? value : ''
}

function numberValue(value: unknown) {
  if (value && typeof value === 'object' && 'value' in value) {
    return Number((value as { value?: string | number }).value || 0)
  }
  return Number(value || 0)
}

function dateValue(value: unknown) {
  if (!value) return ''
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  if (typeof value === 'object' && 'value' in value) {
    return String((value as { value?: string }).value || '').slice(0, 10)
  }
  return String(value).slice(0, 10)
}

function timestampValue(value: unknown) {
  if (!value) return ''
  if (value instanceof Date) return value.toISOString()
  if (typeof value === 'object' && 'value' in value) {
    return String((value as { value?: string }).value || '')
  }
  return String(value)
}

function toSummary(row: Record<string, unknown> | undefined): AdsSummary {
  const localActionDirectionRequests = numberValue(row?.local_action_direction_requests)
  const localActionCalls = numberValue(row?.local_action_calls)
  const localActionWebsiteClicks = numberValue(row?.local_action_website_clicks)

  return {
    rowCount: numberValue(row?.row_count),
    impressions: numberValue(row?.impressions),
    clicks: numberValue(row?.clicks),
    costMicros: numberValue(row?.cost_micros),
    localActionDirectionRequests,
    localActionCalls,
    localActionWebsiteClicks,
    localActions: localActionDirectionRequests + localActionCalls + localActionWebsiteClicks,
  }
}

function emptySummary(): AdsSummary {
  return {
    rowCount: 0,
    impressions: 0,
    clicks: 0,
    costMicros: 0,
    localActionDirectionRequests: 0,
    localActionCalls: 0,
    localActionWebsiteClicks: 0,
    localActions: 0,
  }
}

function connectionErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : ''
  if (message.includes('Could not load the default credentials')) {
    return 'BigQuery 인증 정보가 없어 Google Ads 데이터를 불러오지 못했습니다.'
  }
  if (message.includes('Not found')) {
    return 'Google Ads BigQuery 테이블을 찾지 못했습니다.'
  }
  return message || 'Google Ads 데이터를 불러오지 못했습니다.'
}

export async function GET(request: NextRequest) {
  loadSharedEnv()

  const { searchParams } = new URL(request.url)
  const store = (searchParams.get('store') || '언리미티드').trim()
  const days = Math.min(Math.max(Number(searchParams.get('days') || 30), 7), 90)
  const project = safeIdentifier(process.env.GOOGLE_CLOUD_PROJECT || '', /^[A-Za-z0-9_-]+$/)
  const dataset = safeIdentifier(process.env.BIGQUERY_DATASET || 'gbp_ops', /^[A-Za-z0-9_]+$/)
  const location = process.env.BIGQUERY_LOCATION || 'asia-northeast3'
  const table = project && dataset ? `\`${project}.${dataset}.google_ads_local_actions_daily\`` : ''

  if (!project || !dataset) {
    return NextResponse.json({
      source: 'fallback',
      connected: false,
      status: 'missing_config',
      store,
      message: 'GOOGLE_CLOUD_PROJECT 또는 BIGQUERY_DATASET 환경변수가 없어 Google Ads 데이터를 불러오지 못했습니다.',
      period: { days },
      summary: emptySummary(),
      previousSummary: emptySummary(),
      daily: [],
      adsCustomerIds: [],
    })
  }

  try {
    const bigquery = new BigQuery({ projectId: project })
    const tableCountSql = `SELECT COUNT(*) AS row_count FROM ${table}`
    const [tableCountRows] = await bigquery.query({ query: tableCountSql, location })
    const tableRowCount = numberValue((tableCountRows[0] as Record<string, unknown> | undefined)?.row_count)

    const matchWhere = `
      LOWER(REPLACE(store_name, ' ', '')) = LOWER(REPLACE(@store, ' ', ''))
      OR LOWER(store_name) LIKE CONCAT('%', LOWER(@store), '%')
      OR LOWER(@store) LIKE CONCAT('%', LOWER(store_name), '%')
    `
    const storeStatsSql = `
      SELECT
        COUNT(*) AS row_count,
        MIN(summary_date) AS first_date,
        MAX(summary_date) AS last_date,
        MAX(source_synced_at) AS source_synced_at,
        ARRAY_AGG(DISTINCT ads_customer_id IGNORE NULLS LIMIT 5) AS ads_customer_ids
      FROM ${table}
      WHERE ${matchWhere}
    `
    const [storeStatsRows] = await bigquery.query({
      query: storeStatsSql,
      params: { store },
      location,
    })
    const storeStats = storeStatsRows[0] as Record<string, unknown> | undefined
    const storeRowCount = numberValue(storeStats?.row_count)
    const lastDate = dateValue(storeStats?.last_date)
    const firstDate = dateValue(storeStats?.first_date)
    const sourceSyncedAt = timestampValue(storeStats?.source_synced_at)
    const adsCustomerIds = Array.isArray(storeStats?.ads_customer_ids) ? (storeStats?.ads_customer_ids as string[]) : []

    if (!storeRowCount || !lastDate) {
      return NextResponse.json({
        source: 'bigquery',
        connected: true,
        status: tableRowCount > 0 ? 'no_store_data' : 'empty_table',
        store,
        message:
          tableRowCount > 0
            ? `${store} Google Ads 데이터가 BigQuery 테이블에 아직 없습니다.`
            : 'Google Ads BigQuery 테이블은 연결됐지만 적재된 데이터가 아직 없습니다.',
        period: { days, firstDate, lastDate },
        summary: emptySummary(),
        previousSummary: emptySummary(),
        daily: [],
        adsCustomerIds,
        tableRowCount,
        sourceSyncedAt,
      })
    }

    const daysMinusOne = days - 1
    const summarySql = `
      WITH ranges AS (
        SELECT
          'current' AS period,
          DATE_SUB(DATE(@endDate), INTERVAL @daysMinusOne DAY) AS start_date,
          DATE(@endDate) AS end_date
        UNION ALL
        SELECT
          'previous' AS period,
          DATE_SUB(DATE(@endDate), INTERVAL @previousStartOffset DAY) AS start_date,
          DATE_SUB(DATE(@endDate), INTERVAL @days DAY) AS end_date
      )
      SELECT
        ranges.period,
        COUNT(ads.summary_date) AS row_count,
        SUM(COALESCE(ads.local_action_direction_requests, 0)) AS local_action_direction_requests,
        SUM(COALESCE(ads.local_action_calls, 0)) AS local_action_calls,
        SUM(COALESCE(ads.local_action_website_clicks, 0)) AS local_action_website_clicks,
        SUM(COALESCE(ads.impressions, 0)) AS impressions,
        SUM(COALESCE(ads.clicks, 0)) AS clicks,
        SUM(COALESCE(ads.cost_micros, 0)) AS cost_micros
      FROM ranges
      LEFT JOIN ${table} AS ads
        ON (${matchWhere})
        AND ads.summary_date BETWEEN ranges.start_date AND ranges.end_date
      GROUP BY ranges.period
    `
    const [summaryRows] = await bigquery.query({
      query: summarySql,
      params: {
        store,
        endDate: lastDate,
        days,
        daysMinusOne,
        previousStartOffset: days * 2 - 1,
      },
      location,
    })
    const summaryByPeriod = new Map(
      (summaryRows as Record<string, unknown>[]).map((row) => [String(row.period), toSummary(row)])
    )

    const dailySql = `
      SELECT
        summary_date,
        store_name,
        ads_customer_id,
        local_action_direction_requests,
        local_action_calls,
        local_action_website_clicks,
        impressions,
        clicks,
        cost_micros,
        source_synced_at
      FROM ${table}
      WHERE (${matchWhere})
        AND summary_date BETWEEN DATE_SUB(DATE(@endDate), INTERVAL @daysMinusOne DAY) AND DATE(@endDate)
      ORDER BY summary_date DESC
      LIMIT 90
    `
    const [dailyRows] = await bigquery.query({
      query: dailySql,
      params: { store, endDate: lastDate, daysMinusOne },
      location,
    })

    return NextResponse.json({
      source: 'bigquery',
      connected: true,
      status: 'connected',
      store,
      message: `${store} Google Ads 데이터를 BigQuery에서 불러왔습니다.`,
      period: { days, firstDate, lastDate },
      summary: summaryByPeriod.get('current') || emptySummary(),
      previousSummary: summaryByPeriod.get('previous') || emptySummary(),
      daily: (dailyRows as Record<string, unknown>[]).map((row) => ({
        date: dateValue(row.summary_date),
        storeName: row.store_name || store,
        adsCustomerId: row.ads_customer_id || '',
        impressions: numberValue(row.impressions),
        clicks: numberValue(row.clicks),
        costMicros: numberValue(row.cost_micros),
        localActionDirectionRequests: numberValue(row.local_action_direction_requests),
        localActionCalls: numberValue(row.local_action_calls),
        localActionWebsiteClicks: numberValue(row.local_action_website_clicks),
        sourceSyncedAt: timestampValue(row.source_synced_at),
      })),
      adsCustomerIds,
      tableRowCount,
      sourceSyncedAt,
    })
  } catch (error) {
    return NextResponse.json({
      source: 'fallback',
      connected: false,
      status: 'error',
      store,
      message: connectionErrorMessage(error),
      period: { days },
      summary: emptySummary(),
      previousSummary: emptySummary(),
      daily: [],
      adsCustomerIds: [],
    })
  }
}
