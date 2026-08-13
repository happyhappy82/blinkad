# BlinkAd ERP Local Instructions

이 파일은 BlinkAd ERP 운영 작업공간 전용 지침입니다.

## 역할

- 이 작업공간의 에이전트는 BlinkAd ERP의 운영 담당입니다.
- ERP 운영 기준 브랜치는 `erp/ops`, 공식 Vercel 프로젝트는 `blinkad-erp-ops`입니다.
- 공식 ERP URL은 `https://blinkad-erp-ops.vercel.app/erp`입니다.
- `blinkad` 프로젝트의 `erp/integration` Preview는 구형 검수 주소이므로 운영 주소로 사용하지 않습니다.
- 직접 기능 개발을 시작하기 전에 먼저 `docs/ERP_RESUME.md`를 기준으로 현재 상태와 다음 액션을 복원합니다.

## 재개 절차

작업을 시작하면 먼저 아래 파일을 읽고 현재 상태를 확인합니다.

1. `docs/ERP_RESUME.md`
2. `git status --short`
3. `git branch --show-current`
4. `git pull --ff-only origin erp/ops`
   단, 의도적으로 다른 작업 브랜치에서 작업 중이면 해당 브랜치 기준으로 pull합니다.

## 운영 브랜치 및 배포 원칙

- `erp/ops`를 BlinkAd ERP 운영 기준 브랜치로 사용합니다.
- 운영 배포는 이 작업공간에서 `vercel --prod --scope aijeonginsight-1976s-projects`로 실행합니다.
- 배포 후 `https://blinkad-erp-ops.vercel.app/erp`의 응답과 최신 배포 상태를 확인합니다.
- `blinkad` Vercel 프로젝트는 `blinkad.kr` 본사이트용이므로 ERP 정리 과정에서 삭제하거나 운영 설정을 변경하지 않습니다.
- 다른 작업 브랜치 결과를 합칠 때는 기능을 유지하면서 충돌을 해결합니다.
- 기존 사용자/다른 에이전트 변경을 되돌리지 않습니다.
- `app/erp/ErpClient.tsx`는 충돌 가능성이 높은 공용 파일이므로 수정 전후 diff를 반드시 확인합니다.

## 작업 후 정리

의미 있는 ERP 변경 후에는 다음을 수행합니다.

1. 필요한 검증 실행: 최소 `npx tsc --noEmit`, 가능하면 `npm run build`
2. 작업 흐름이나 재개 포인트가 바뀌면 `docs/ERP_RESUME.md` 업데이트
3. 커밋 메시지에 `Co-Authored-By: Codex <codex@openai.com>` 포함
4. 원격 브랜치에 push

## 금지/주의

- 상위 프로젝트의 `context/` 폴더는 사용자 확인 없이 수정하지 않습니다.
- `~/.claude/`는 수정하지 않습니다.
- Notion 작업큐 상태는 변경하지 않습니다.
- Google Ads API로 성과·소재를 조회할 때는 조회 전용 작업만 수행합니다. 기존 캠페인, 광고그룹, 키워드, 광고 소재(문구·이미지·영상·URL), 예산, 입찰, 상태를 생성·수정·일시중지·활성화·삭제하는 요청은 절대 실행하지 않습니다.
- Google Ads 변경 작업은 사용자가 별도로 요청하더라도 이 조회 기능과 같은 실행 흐름에서 처리하지 않습니다. 코드에서는 `searchStream`과 접근 가능 고객 조회 외 Google Ads API 경로를 허용하지 않습니다.
