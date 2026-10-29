# 공식 사이트 용어사전 반영

2026-10-29. 형님이 비공개 주소 접속 실패를 제보하고 제목의 점 제거와 배포를 지시했다. 이전 Tailscale 미리보기는 서버와 허용된 Mac에서200이지만 실제 휴대폰의 연결 상태는 확인되지 않았다. 공식 사이트 `/glossary`는 반영 전404였다. 이번 변경은 본사 공식 사이트의 공개 경로로 제공하기 위한 것이다.

- 기존64개 용어·7개 분류·목록4개를 Next.js의75개 정적 페이지로 통합했다. 사전 제목과 다음 단계 제목의 장식용 마침표를 제거했다. `robots.txt`, `llms.txt`, `Schema.org`처럼 고유 용어에 포함된 점은 유지했다.
- 현재 공식 Navbar/Footer와 기존 GTM/Tracker를 재사용하고 메뉴에 용어사전을 추가했다. 영어/일본어/중국어 메뉴명만 번역사전에 추가했다. 용어사전 본문은 한국어이며 번역 페이지를 만들었다고 표시하지 않는다.
- 검색·초성·가나다 정렬은 React 컴포넌트로 동작하고, 분류·용어·페이지 이동은 실제 HTML 링크다. CSS는 Next.js의 내용 버전이 적용된 자산으로 빌드한다. 미리보기의 CSS 스냅샷/독립 스크립트/비공개 서버를 운영 경로에서 사용하지 않는다.
- 각 페이지의 제목/설명/공식 canonical/OG/JSON-LD와75개 사이트맵 항목, 검색 허용 설정을 적용했다. 이전 `/glossary/seo`, `/geo`, `/indexing`은308로 이동하고 알 수 없는 하위 주소는404다.
- 기존64개 상세 본문의 글과 출처·연관 링크를 보존했다. 본문 HTML은 검토한 사전의 정적 입력이며 방문자가 제출한 HTML이 아니다. 신규 API·계정·추적 이벤트·배포 자동화는 추가하지 않았다.

검증: `npm run build`, `npx tsc --noEmit`, 기존 언어검사13건 통과. 로컬75개 HTTP200·title/H1/canonical/색인 허용·본문64개 보존·사이트맵75·CSS 정상, 이전3주소308/미존재404. 실제 Chrome에서 데스크톱 화면,390px 목록/상세, 검색/초성/가나다정렬/정렬 유지 다음페이지/모바일메뉴를 확인했다. 콘솔 표본에 메시지/오류가 없었으며 실물 휴대폰 접속 확인은 아니다.

자료 원본: yjcentral-review 저장소의 `docs/blinkad-glossary-20261029/preview/` (기존 검토 시안). `scripts/import-glossary-preview.py <preview-folder>`가 사전 본문/메타/분류·검색 자료를 `content/glossary/pages.json`으로 가져오며 비공개 origin을 공식 주소로 바꾼다. 실행 환경의 BeautifulSoup를 쓰는 수동 가져오기이며 운영 빌드의 의존성은 아니다.

운영 배포 완료: https://www.blinkad.kr/glossary . Git main 커밋 `88f28549b822f471cc999354c1d01e987a274d50`, Vercel `dpl_69HLHgAcyyMGY7oWxvu4L4w6JV7P`의 READY/PROMOTED·공식도메인 연결을 확인했다. 기존 Git 자동 배포1건만 사용했고 중복 CLI 배포는 실행하지 않았다.

공개 검증:75주소 모두200,64개 상세 본문 일치,75 canonical·검색 허용·사이트맵 일치,제목 끝 장식점0·비공개주소0,기존3상세308,apex공식주소200,기존6페이지200/사전메뉴,공개CSS/JS13개200. 실제 Chrome의공개주소390px화면도 확인했다. `production-verification.json`에기록했다. 실물휴대폰·실제Google색인·검색/AI유입성과는측정하지않았다.
