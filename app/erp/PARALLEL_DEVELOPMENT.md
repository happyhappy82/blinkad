# BlinkAd ERP Parallel Development

## Simple Workflow

1. Each agent works only in its own worktree and branch.
2. Each agent commits and pushes its branch.
3. Each agent opens a PR or reports the branch + latest commit.
4. The integration owner merges branches into `erp/integration` in order.
5. Vercel Preview is checked from `erp/integration`.
6. Only after Preview passes, `erp/integration` is merged into `main`.

## Branch Order

1. `erp/calendar`
2. `erp/crm`
3. `erp/automation`
4. `erp/ops`

`erp/ops` usually touches the largest store-operation UI, so merge it last.

## Agent Completion Report

```md
Branch:
- erp/calendar

Latest commit:
- abc1234 Message

Local URL:
- http://localhost:3011/erp

Checked menus:
- 일정관리
- 미팅관리
- 주간미팅

Changed files:
- app/erp/_components/calendar/MeetingPanels.tsx
- app/api/erp/google/calendar/route.ts

Verification:
- npx tsc --noEmit: pass/fail
- npm run build: pass/fail

Preview check needed:
- yes/no
- reason

Merge notes:
- keep sidebar toggle
- keep CRM card OCR
- watch app/erp/ErpClient.tsx conflicts
```

## Integration Checklist

- `git status` is clean before merge.
- Merge one branch at a time.
- Resolve conflict markers before running tests.
- Run `npx tsc --noEmit` after each merge when possible.
- Run `npm run build` before pushing `erp/integration`.
- Check Vercel Preview `/erp`.
- Confirm these areas still work:
  - sidebar collapse/hover behavior
  - 문의관리/팔로업/고객관리
  - 명함관리
  - 일정관리/미팅관리/주간미팅
  - 견적서/진단자료 buttons
  - 매장 운영관리 reports
  - Google Ads tab fallback/data view

## Main Merge Rule

Never merge a feature branch directly into `main` during parallel ERP work.
Use `erp/integration` as the single staging branch for combined testing.

