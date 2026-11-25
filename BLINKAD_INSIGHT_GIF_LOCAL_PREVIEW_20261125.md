# 블링크애드 인사이트 GIF 본문 로컬 검토

확인일: 2026-11-25 KST. 상태: 로컬 반영·검토 완료, 공식 배포 전.

## 확인 주소

[GIF가 들어간 본문 위치](http://127.0.0.1:18951/blog/google-jidoeneun-naoneunde-mun-euiga-eobsdamyeon-eodibuteo-bolkka#inquiry-gap-demo)

[글 처음부터 보기](http://127.0.0.1:18951/blog/google-jidoeneun-naoneunde-mun-euiga-eobsdamyeon-eodibuteo-bolkka)

[인사이트 목록](http://127.0.0.1:18951/blog)

형님이 로컬로 요청해 localhost에서 확인하도록 구성했다. 같은 컴퓨터에서 열 수 있으며 외부 HTTPS 터널은 만들지 않았다. 서버 실행이 유지돼야 주소가 열린다.

## 반영한 모습

실제 인사이트 글 ‘Google 지도에는 나오는데 문의가 없다면 어디부터 볼까?’의 현재 소스와 디자인을 사용했다. ‘조회와 문의 사이를 네 구간으로 나눠봅니다’ 표와 설명 문단 뒤, 실제 조회·상호작용 수치를 설명하는 소제목 앞에 GIF 한 개를 넣었다.

- 본문 최대 폭에 맞춘 흰 배경 GIF와 둥근 모서리.
- HTML 설명 한 줄: ‘문의 버튼 클릭과 실제 접수는 별도로 확인합니다.’
- 움직임 멈추기·재생 버튼. 움직임 줄이기 설정에서는 정지 프레임으로 시작.
- 기존 본문·제목·URL·날짜·표·관련 링크의 원본 데이터는 변경하지 않았다. 해당 글에만 미디어를 삽입하는 렌더링을 추가했다.
- 로컬 검토에서만 하단 뒤로가기·전체 글/목록·GIF 위치 이동을 표시한다. 직접 진입 때 뒤로가기는 실제 목록으로 이동한다.

기존 1크레딧 GIF 원본을 바이트 단위로 동일하게 복사했다. 실제 파일은 768×432, 3.2초/16프레임이며 초기 요청6초와 다르다. 글자·카드가 조금 흔들리는 원본 특성은 그대로다. 첫 프레임 PNG는 기존 GIF에서 추출한 정지 화면이다. 신규 이미지·영상 생성이나 추가 크레딧 사용은 없다.

## 구현과 로컬 실행

격리 작업 폴더: `/tmp/blinkad-insight-gif-preview-20261125`

기준: `origin/main` 516a724. 브랜치: `erp/insight-gif-preview-20261125`. 기존 vercel.json의 `erp/*` 자동 배포 제외 규칙을 확인했고 배포 설정을 변경하지 않았다.

```bash
cd /tmp/blinkad-insight-gif-preview-20261125
BLINKAD_LOCAL_PREVIEW=1 ./node_modules/.bin/next dev --hostname 127.0.0.1 --port 18951
```

현재 서버 exec 세션10802, Ego 검토공간139. 기존 node_modules를 심볼릭 링크로 재사용했고 새 패키지를 설치하지 않았다. 언어 생성기의 ignored localized 파일만 로컬에 생성했다.

`BlogContentWithMedia`가 대상 글의 확인된 문단 바로 뒤에 `BlogInquiryGapFigure`를 삽입한다. 나머지 글은 기존 HTML 렌더링을 그대로 사용한다. 원래 글 데이터 `constants/index.ts`는 기준 커밋과 SHA가 같다.

`BLINKAD_LOCAL_PREVIEW=1` 환경변수에서만 noindex/nofollow, 로컬 검토 이동 메뉴, GTM·Tracker 제외를 적용한다. 변수가 없는 운영 기본 동작은 보존한다. 개발 서버는 실행 중인 다른 검토 서버와 분리된 포트를 사용한다.

## 검증

- `tsc --noEmit` 통과. Next dev 대상 글·목록·비대상 GEO 글 컴파일 및 HTTP200.
- 대상 글의 GIF 삽입1개·삽입 순서, GIF/정지화면200, 원본 GIF SHA 일치.
- 비대상 GEO 글에 GIF 없음. `constants/index.ts` 원본 전체 불변.
- Ego에서 PC1440×1000, 모바일390×844, 좁은320px 폭 확인. 문서 가로 넘침 없음. 이미지 본문 폭 맞춤.
- 재생/멈추기, 움직임 줄이기 정지 표시, 목록→글→뒤로가기, 하단 이동 메뉴 동작 확인. 버튼 최소44px 높이.
- 로컬 응답 noindex/nofollow 및 GTM 삽입 없음 확인.

[PC 화면](docs/research/blinkad-insight-gif-preview-20261125/desktop.png) · [모바일 화면](docs/research/blinkad-insight-gif-preview-20261125/mobile.png) · [검증 기록](docs/research/blinkad-insight-gif-preview-20261125/verification.json)

전체 production build·실기기/5G·외부 HTTPS·CWV 실측은 하지 않았다. 이번 작업은 로컬 검토이며 공식 main 병합·발행·배포·실제 문의 제출은 하지 않았다. 다음은 형님 본문 배치 검토 후 요청 범위에서 크기·간격·문구를 조정하는 것이다.
