# 페슈 GIF 본문 공식 적용·배포 완료 — 2026-11-25

형님 “1번은 적용해서 커밋 후 배포” 지시에 따라 기존 검토 GIF 그대로 병원 정보 구성 글에 공식 적용했다. 별도 줌/커서 개선이나 새 영상 생성은 하지 않았다.

공식 글: https://www.blinkad.kr/blog/hospital-website-content-structure

- Git happyhappy82/blinkad, main 2570fbf3d3b0738a9374a43f510ebf891dad6136. 격리 erp/peche-article-release-20261125에서 4파일만 검수 후 main을 fast-forward하고 push했다. 이전 조사 문서/검토 서버 스크립트를 main에 합치지 않았다.
- 대상4파일: BlogContentWithMedia, 새 BlogClinicNavigationFigure, peche-clinic-navigation.gif/png. 첫 소제목 절 끝에 figure1개·짧은 설명·페슈 출처·촬영일과 재생정지/움직임줄이기 반영.
- Vercel Git 배포 dpl_7etenXmxELfxTD7hvyLhExX2bm3m, production READY. www.blinkad.kr 등 기존 도메인 별칭 연결. 빌드로그 Branch main/Commit2570fbf 대조. CLI 중복 배포0.
- 전체 빌드685/685·본문기존텍스트 동등(figure제외)·figure1개·원본GIF SHA d8bcf59bf049ef25b2315c8d4fb75887b27daca6976e160e2c54f291c2259af7 확인. 기존 지도/언어전환 컴포넌트, 사이트 언어/배포설정 보존.
- 로컬 넓은화면 및390/320px 가로넘침 없음·44px제어·정지/재생/움직임줄이기 확인. 첫 스크린샷에서 그림 일부만 잡혀 스크롤 위치를 조정해 다시 촬영했다. 넓은화면 캡처의 실제뷰포트는1123px다.
- 운영 HTML/GIF 접근·SHA·원문 동등 확인. 최초 검증 파서는 self-closing태그 처리 오류로 실패했으며 figure단위 제외로 수정 후 통과했다. 앱소스는 이 때문에 변경하지 않았다. 공식390px UI에서 가로넘침없음/이미지340px·정지/재생 확인했고 mobile-production.png와 ui-verification.json으로 저장했다. 최초클릭은짧은뷰포트하단밖이어서좌표관찰후버튼을화면안으로스크롤해표준클릭으로통과·코드수정0. 실제 휴대폰5G·검색/AI인용·문의 성과는 미측정.

증거 docs/research/peche-release-20261125/. 추가 생성/크레딧0·ScreenStudio/MCP설치0. 기존 검토 서버18951/18952와터널 유지. 별도 로컬 검증 서버18954는 이 검수용이다. 새2번GEO는 별도 GIF검토본만 제작하며 이번 공식배포에는 포함하지 않았다.
