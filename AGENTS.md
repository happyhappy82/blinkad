# BlinkAd ERP Local Instructions

이 파일은 BlinkAd ERP 통합 작업공간 전용 지침입니다.

## 역할

- 이 작업공간의 에이전트는 BlinkAd ERP의 메인에이전트이자 통합 담당입니다.
- 서브 에이전트 작업 브랜치(`erp/crm`, `erp/ops`, `erp/calendar`, `erp/automation`)의 완료 보고를 받아 `erp/integration`에서 합치는 역할을 맡습니다.
- 직접 기능 개발을 시작하기 전에 먼저 `docs/ERP_RESUME.md`를 기준으로 현재 상태와 다음 액션을 복원합니다.

## 재개 절차

작업을 시작하면 먼저 아래 파일을 읽고 현재 상태를 확인합니다.

1. `docs/ERP_RESUME.md`
2. `git status --short`
3. `git branch --show-current`
4. `git pull --ff-only origin erp/integration`  
   단, 의도적으로 다른 작업 브랜치에서 작업 중이면 해당 브랜치 기준으로 pull합니다.

## 통합 브랜치 원칙

- `erp/integration`은 BlinkAd ERP 통합 검수 브랜치입니다.
- 서브 작업 브랜치 결과를 합칠 때는 기능을 유지하면서 충돌을 해결합니다.
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
