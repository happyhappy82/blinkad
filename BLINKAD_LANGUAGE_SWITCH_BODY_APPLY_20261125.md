# 다국어 홈페이지 인사이트 본문에 피부과 언어 전환 GIF 적용

기준일: 2026-11-25 KST. 상태: main 저장·공식 배포·운영 검증 완료.

대상: https://www.blinkad.kr/blog/add-multilingual-pages-existing-hospital-website

## 요청과 적용

형님이 검토한 피부과 샘플 GIF를 해당 글 본문에 적용하라고 요청했다. ‘기존 홈페이지에서 무엇을 살리고, 무엇을 추가할까요?’ 절의 표와 견적 설명이 끝난 뒤, ‘가능 여부는 제작 방식과 변경 권한을 보고 판단합니다’ 소제목 앞에 1개 넣었다.

아이보리·베이지 색감의 가상 피부과 샘플에서 한국어 → 언어 메뉴 확대 → English 선택 → 동일 구성 영어 화면으로 바뀌는 4초 GIF다. 한국어 본문에만 추가했다. 재생·정지와 운영체제의 움직임 줄이기 설정을 지원한다. 그림 아래 짧은 설명, 가상 피부과 예시 표시, engin akyurt / Unsplash 사진 출처를 함께 표시했다. 기존 인사이트 원문·제목·주소·날짜와 메타데이터·추적 설정은 보존했다.

## 코드와 매체

`happyhappy82/blinkad` main 커밋: `87dbd6f74223fee66ba9dafffd725d144b286d25`.

격리 작업 폴더: `/tmp/blinkad-insight-language-switch-body-20261125`, 브랜치 `erp/insight-language-switch-body-20261125`. 최신 main을 pull한 뒤 작업했고 코드 브랜치 push → main fast-forward → main push를 완료했다. 운영용 변경은 `BlogContentWithMedia.tsx`, 새 `BlogLanguageSwitchFigure.tsx`, GIF와 PNG의 4파일이다. 기존 지도 문의 글의 컴포넌트·GIF·포스터와 다른 글은 유지했다. 기존 `erp/*` 자동 미리보기 제외 및 본사이트 Vercel 설정은 바꾸지 않았다.

- GIF: 960×540, 4초, 20fps, 80프레임, 3,838,627바이트.
- GIF SHA256: `9522ebddce93fb38937d071cef4032379f56e9cf39d9fb0c55c2a652d015713a`.
- PNG: 258,559바이트. 검토한 원본의 첫 프레임이며 정지·움직임 줄이기에서 표시한다.
- 추가 Higgsfield/API 생성 0회, 추가 크레딧 0.

본문의 다른 위치로 이동하는 링크 식별자 `language-switch-demo`는 요소에만 사용한다. 전달용 공식 링크에는 별도의 `#` 식별자를 붙일 필요가 없다.

## 검증

`npm run build` 통과, 정적 페이지 생성 685/685 완료. 기존 포스트 검증 경고와 libheif/Browserslist 경고는 남아 있으며 이번 변경으로 발생한 빌드 실패는 없다. 생성된 실제 HTML에서 해당 GIF 위치와 1개 삽입, 단일 H1·canonical·색인 차단 없음, 기존 지도 글 1개 GIF 유지·비대상 GEO 글 미삽입을 확인했다. 원문 데이터, 기존 지도 글 매체/컴포넌트, SiteDocument와 vercel.json 바이트 보존을 확인했다.

로컬 운영 빌드 서버 127.0.0.1:18953에서 Ego139를 재사용했다. PC 1440px에서 본문 폭에 맞는 표시, 모바일 390/320px에서 가로 넘침 없음, 44px 제어 버튼, 재생/정지·움직임 줄이기 전환을 확인했다. 최초 브라우저 클릭 확인은 시간 초과되어 같은 페이지 상태를 확인한 뒤 페이지가 안정된 상태에서 재생/정지를 검증했다. 이 확인 문제 때문에 소스 코드를 수정하지는 않았다. 실제 휴대폰 5G 테스트는 하지 않았다.

운영 배포 `dpl_Aw4ynQpKXxdmT2TNR982WfkC7Sey`는 Ready다. `www.blinkad.kr` 별칭이 이 배포를 가리키는 것을 CLI로 확인했다. Git main push가 만든 배포이며 중복 CLI 배포·별도 promote는 하지 않았다. 운영 글·GIF·PNG HTTP200, 원본 매체 SHA 일치, 단일 GIF·H1·canonical·GTM 유지·색인 차단 없음, 기존 지도 글의 GIF 유지 확인을 마쳤다. 운영 HTML에서 새 figure만 제외하면 기존 article 텍스트가 배포 전과 정확히 같다.

공식 사이트의 390px 모바일 브라우저에서 문서 폭390px·그림340px·버튼44px, 재생/정지를 확인했다. 최종 공식 글 탭을 Ego139에 keep했다. 실제 문의·검색·AI 인용 효과와 실기기5G는 측정하지 않았다.

검증 JSON과 로컬PC·모바일 및 운영 모바일 스크린샷은 `docs/research/blinkad-language-switch-body-20261125/`에 보관한다. 기존 검토 서버18952·터널과 다른 작업 서버는 보존했다. 이번 확인용 18953 로컬 운영 빌드 서버만 종료했다. 공식 본문 적용 요청은 완료됐으며 다음 제작·수정은 형님 지시에 따른다.
