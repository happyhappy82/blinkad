# BlinkAd ERP 로컬 워커

배포된 ERP는 Vercel 서버에서 실행되므로 로컬 Codex 스킬 파일을 직접 실행할 수 없다. 견적서/진단자료 생성 버튼은 배포 서버가 로컬 워커 웹훅으로 요청을 보내고, 로컬 Mac의 워커가 PDF 생성과 Notion 업로드를 처리하는 방식으로 연결한다.

## 실행 구조

1. ERP에서 견적서 생성 또는 진단자료 생성 버튼 클릭
2. `/api/erp/actions/quote` 또는 `/api/erp/actions/diagnosis`가 로컬 워커 웹훅으로 작업 요청
3. 로컬 Mac의 `scripts/erp-quote-worker.mjs`가 요청 수신
4. 로컬 Codex 견적서/진단자료 스킬 스크립트 실행
5. 생성된 PDF를 Notion 문의관리 DB의 `견적서` 또는 `분석자료` 열에 업로드

## 로컬 실행

```bash
npm run erp:action-worker
```

기존 명령인 `npm run erp:quote-worker`도 같은 워커를 실행한다.

기본 주소는 `http://127.0.0.1:8787`이고, 헬스 체크는 `GET /health`를 사용한다.

| endpoint | 용도 | 필수 payload |
| --- | --- | --- |
| `POST /quote` | 견적서 PDF 생성 후 Notion `견적서` 열 업로드 | `storeName`, `notionName` |
| `POST /diagnosis` | 진단자료 PDF 생성 후 Notion `분석자료` 열 업로드 | `storeName`, `notionName`, `googleMapUrl` |

## 배포 ERP와 연결

로컬 워커를 배포 ERP에서 호출하려면 터널 주소가 필요하다.

```bash
ngrok http 8787
```

또는 Cloudflare Tunnel을 사용할 수 있다.

```bash
cloudflared tunnel --url http://127.0.0.1:8787
```

Vercel 환경변수에는 아래 값을 넣는다.

```bash
ERP_ACTION_WORKER_WEBHOOK_URL=https://터널주소
ERP_ACTION_WORKER_SECRET=임의의_긴_비밀값
```

로컬 워커 실행 환경에도 같은 `ERP_ACTION_WORKER_SECRET`을 넣으면 외부 요청을 간단히 제한할 수 있다.

```bash
ERP_ACTION_WORKER_SECRET=같은_비밀값 npm run erp:action-worker
```

기존 견적서 전용 환경변수도 계속 지원한다.

```bash
QUOTE_WORKER_WEBHOOK_URL=https://터널주소/quote
QUOTE_WORKER_SECRET=같은_비밀값
```

진단자료만 별도 터널로 분리해야 할 때는 `DIAGNOSIS_WORKER_WEBHOOK_URL=https://터널주소/diagnosis`를 사용할 수 있다.

## 로컬 개발 서버에서 직접 실행

터널 없이 로컬 개발 서버에서만 테스트할 때는 기존 직접 실행 모드를 사용할 수 있다.

```bash
ERP_ENABLE_LOCAL_SKILLS=true npm run dev
```

단, 이 방식은 로컬 Next.js 서버에서만 유효하고 Vercel 배포 환경에서는 로컬 파일 시스템의 Codex 스킬을 실행할 수 없다.
