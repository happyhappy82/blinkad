# 병원 정보 구성 글 — 페슈의원 GIF 본문 적용 검토

확인일: 2026-11-25 KST. 상태: 본문 코드 적용·모바일 검토 공유 완료. 공식 배포 전.

[본문 검토](https://petition-transcripts-possibly-boot.trycloudflare.com/blog/hospital-website-content-structure/) · [전체 원고/목록](https://petition-transcripts-possibly-boot.trycloudflare.com/blog/)

형님 ‘글에 적용한 다음에 한번 보여줘’ 요청에 따라 추천한 **병원 소개·의료진·진료 안내를 검색 가능한 페이지로 구성하는 법** 글에 기존 페슈의원 GIF를 넣었다. ‘페이지는 방문자가 확인할 질문에 맞춰 나눕니다’ 절 끝, ‘의료진과 진료 정보는 승인된 자료에서 시작합니다’ 소제목 앞이다. 메인 메뉴에서 시술 안내로 이어지는 짧은 설명과 실제 사이트 구성 예시·페슈의원 원본 링크·촬영일을 함께 표시했다. 검토를 먼저 보여주는 범위이며 운영 배포는 수행하지 않았다.

기존 실제 사이트 GIF4초/960×540/80프레임/3649833바이트를 그대로 사용했다. SHA256 `d8bcf59bf049ef25b2315c8d4fb75887b27daca6976e160e2c54f291c2259af7`. 추가 생성·Higgsfield 크레딧0. 재생/정지, 움직임 줄이기 설정을 지원하고 기존 원문·제목·메타데이터·다국어 경로·추적·배포 설정과 지도/언어전환 GIF는 유지했다. 검토 HTML에서 새 figure를 제외한 article 텍스트는 현재 공식 글과 정확히 같다.

최신 main87dbd6f pull 후 `/tmp/blinkad-peche-article-preview-20261125` / `erp/peche-article-preview-20261125` 격리 브랜치에서 작업했다. 실제 반영용 소스는 `BlogContentWithMedia.tsx`, 새 `BlogClinicNavigationFigure.tsx`, GIF와 PNG4파일이다. 검토를 위한 export/제한 서버 스크립트와 증거는 별도 보관한다. `erp/*` 자동 Git 미리보기 제외 설정은 변경하지 않았다.

이전 /tmp 검토 폴더와 서버·터널이 사라져 과거 shoes-adopt-pushed-humanities 주소를 유지할 수 없었다. Documents/Claude Code 읽기본에서 매체를 복원하고 원본 SHA를 확인했다. 기존 설치된 cloudflared `/Users/mcbookpro/.local/share/blinkad/previews/seo-monthly-demand/cloudflared`를 재사용해 새 임시 주소로 연결했다. 다른 검토 서버나 맥락을 종료하지 않았다. Next 개발 서버18951/exec33946, 제한 정적 서버18952/exec89578, 터널exec41916과 로그 `/tmp/blinkad-peche-article-tunnel-20261125.log`를 유지한다. 주소는 맥·서버·터널 실행 중에 유효하다.

실제 Next 본문을 렌더링하고 필요한 글1·목록1, CSS·로고·GIF·PNG·작은 제어JS만 정적으로 공유한다. 앱 런타임·소스·API·폼·GTM을 공유하지 않고 noindex를 설정했다. 최초 export는 GTM preconnect 링크가 남은 것을 자체 검증이 발견해 제거한 뒤 통과했다. 서버는 `.peche-article-share/public`만 제공하고 디렉터리 목록을 허용하지 않는다. 해당 생성 폴더는 Git에 넣지 않는다. 다시 수정하면 같은 개발 서버에서 source를 수정하고 `scripts/export-peche-article-preview.py`를 재실행하면 된다.

TypeScript 검사·해당 페이지 HTTP 렌더링 통과. 원문/메타/추적/배포 설정·기존 두 GIF 원본의 바이트 일치를 확인했다. Ego4에서 PC1440px 및390/320px 가로 넘침 없음·그림 폭766/340px·44px 제어·하단 뒤로/전체 목록·GIF 이동·재생정지·움직임줄이기를 확인했다. 고정 하단 메뉴는61px이며 본문 끝에92px 이상 여백을 둔다. 외부HTTPS 글·목록·매체·JS200·바이트 일치, API/.env/.git/스크립트/디렉터리 목록404 확인. 최종 본문 GIF 위치 탭을keep했다. 실제 휴대폰5G/운영 전체 빌드/검색·문의 성과는 이번 검토 범위에서 측정하지 않았다.

검증과 스크린샷은 `docs/research/peche-article-preview-20261125/`, 로컬 읽기본은 `~/Documents/Claude Code/outputs/peche-article-preview-20261125/`다. main 병합·공식 홈페이지 배포0. 다음은 형님 배치 검토 후 수정 또는 배포 지시 범위에서 진행한다.
