# 페슈의원 실제 사이트 화면 GIF — 제작·모바일 검토 완료

제작일: 2026-11-25 KST. 형님이 ‘완성된 것 공유’를 요청해, 직전 가능 여부 확인에서 제안한 실제 사이트 GIF를 이번에 제작했다. 이전 턴에는 새 GIF가 없었다는 점을 먼저 알렸다.

[모바일 검토](https://shoes-adopt-pushed-humanities.trycloudflare.com/real-clinic/preview.html) · [GIF 원본](https://shoes-adopt-pushed-humanities.trycloudflare.com/real-clinic/clinic-navigation.gif) · [MP4](https://shoes-adopt-pushed-humanities.trycloudflare.com/real-clinic/clinic-navigation.mp4)

[페슈의원 공식 사이트](https://pecheskin.clinic/ko) 메인에서 ‘전체 시술’을 실제로 클릭하고, 데이터 로드를 기다려 진료 목록으로 이동한 것을 확인했다. 이 두 실제 화면을 캡처해 메인 → 메뉴 약3배 확대·커서 선택 → 시술 안내의4초 타임라인으로 편집했다. 웹사이트 디자인·인물·글자를 AI로 생성하거나 원문을 바꾸지 않았다. 화면 안에 사이트 예시·출처를 표시하고 검토 페이지에서도 원본 사이트를 연결했다. 해당 병원을 블링크애드의 제작 실적으로 소개하지 않는다.

실시간 연속 녹화가 아니라 **실제 화면 캡처와 확대·커서·장면 전환 편집본**이다. 로딩 대기 시간은 제외했으며, 최종 시술 안내는 실제 페이지에서240px 내려 촬영한 화면이다. 원본은1600×900 저장, 브라우저 DPR2였지만 Ego 스크린샷 파일은 CSS 해상도였다. 최종은960×540·4.0초·20fps·80프레임·무한 반복이다.

- GIF3,649,833바이트. SHA256 `d8bcf59bf049ef25b2315c8d4fb75887b27daca6976e160e2c54f291c2259af7`.
- MP4346,623바이트. 정지/재생을 위한 첫 프레임 PNG도 제공.
- 추가 Higgsfield/API 생성0회·추가 크레딧0.

초기0~8프레임과 최종46~79프레임은 각각 한 컷을 유지했다. 최종 소스·GIF 디코딩34프레임 동일,4초·80프레임·무한반복을 확인했다. 메인·확대 메뉴·선택·실제 목록 프레임을 시각 검수했다. 외부HTTPS 검토/목록/GIF/MP4/PNG200·로컬 원본 바이트 일치,390px 문서폭390/이미지350·넘침없음·하단링크44px·정지재생·목록/뒤로이동을 확인했다. 실기기5G 테스트는 하지 않았다. Ego139 최종 검토 탭을keep했다.

기존 정적서버18952/exec28022·터널exec20207과 같은 외부 HTTPS 주소를 재사용했다. 새 서버/터널0. 새 공개 폴더 `/real-clinic/`에는 검토·목록HTML/GIF/MP4/PNG5파일만 남겼다. 렌더링용 임시 composition/소스사진은 공유 폴더에서 제거했다. 메타데이터·캡처 스크립트·composition은404이며 저장소에만 보관한다. 이 주소는 맥·서버·터널이 실행 중일 때 쓰는 임시 검토 링크다. 기존 언어전환 및 지도 글 검토·공식 매체는 그대로 유지했다.

소스와 재현 스크립트는 `docs/research/peche-real-site-gif-20261125/`, 읽기본은 `~/Documents/Claude Code/outputs/peche-real-site-gif-20261125/`다. `capture-source.ego.mjs`로 실제사이트 캡처, 임시 공유루트에 composition과 두 소스PNG 복사, `capture-frames.ego.mjs` 실행, `encode-media.py` 실행 순서다. 임시 공유루트와 Ego139가 필요하며 캡처80프레임은 `/tmp/blinkad-peche-real-site-frames-20261125/`에만 둔다. 신규 패키지 설치0.

이번은 GIF 제작·검토 공유까지 완료했다. 공식 인사이트 본문 수정·main 병합·운영 배포는0이며 적용할 글/피부과 사례로의 본문 기획은 확정하지 않았다. 실제 AI 오소개·SEO/GEO 성과·시술 효과·의료진 실적은 이번 제작에서 검증하지 않았다. 다음은 형님 검토 후 요청한 글의 맥락에 맞춰 적용하는 일이다.
