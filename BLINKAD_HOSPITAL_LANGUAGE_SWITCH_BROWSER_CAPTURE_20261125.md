# 피부과 홈페이지 언어 전환 — 실제 웹 화면 캡처 GIF

**최신 상태:** 형님 요청으로 피부과 샘플 GIF의 [공식 인사이트 본문 적용·배포](BLINKAD_LANGUAGE_SWITCH_BODY_APPLY_20261125.md)를 완료했다. main `87dbd6f`, 운영 배포 Ready 및 실제 글·모바일 동작 확인. 아래 제작/검토 단계의 적용 전 상태는 당시 이력이다.

제작·수정일: 2026-11-25 KST. 상태: 피부과 디자인 수정과 검토 완료. 공식 인사이트 본문 적용 전.

[모바일 검토](https://shoes-adopt-pushed-humanities.trycloudflare.com/language-switch-browser/preview.html) · [GIF 원본](https://shoes-adopt-pushed-humanities.trycloudflare.com/language-switch-browser/language-switch.gif)

## 이번 요청과 변경

형님 요청에 따라 기존 범용 병원 샘플을 피부과 홈페이지로 수정했다. 아이보리·베이지·브라운 색상, 절제된 SAMPLE 워드마크, 피부 진료·시술 안내·의료진 메뉴, 피부 관리 사진, 상담 예약 버튼, 여드름·색소·리프팅 항목으로 구성했다. 실존 병원이나 환자의 사례를 재현한 것이 아닌 가상 피부과 구성 예시다. 이전 버전은 Git 이력에 남아 있다.

한국어 제목은 ‘피부를 위한, 섬세한 진료.’, 영어는 ‘Thoughtful care for your skin.’이다. 설명은 ‘피부 고민을 듣고, 나에게 맞는 진료를 함께 찾습니다.’와 ‘Tell us your skin concerns. Let’s find the right care for you.’를 사용했다. 버튼은 ‘상담 예약’ / ‘Book a Consultation’이다. 의료진 자격·치료 효과·실적은 만들지 않았다.

## 동작과 파일

기존 실제 HTML/CSS와 작동하는 언어 메뉴를 유지했다. 한국어 전체 화면 → 언어 메뉴 약 2배 확대 → English 선택 → 동일한 구성의 영어 화면으로 이어진다. 시간별 DOM 클릭과 커서·확대를 제어하고 Ego 브라우저 화면을 캡처한 뒤 FFmpeg로 편집했다. 사람이 수동으로 촬영한 녹화라고 표시하지 않는다.

- GIF: **960×540 · 4.0초 · 20fps · 80프레임 · 무한 반복**, 3,838,627바이트.
- MP4: 같은 4초 타임라인, 429,815바이트. 사진 때문에 GIF 용량이 늘었으며 MP4는 웹 삽입용 보조 파일이다.
- 추가 Higgsfield/API 생성 **0회**, 추가 크레딧 **0**.
- GIF SHA256: `9522ebddce93fb38937d071cef4032379f56e9cf39d9fb0c55c2a652d015713a`.

초기 한국어 0~9프레임과 최종 영어 50~79프레임은 각각 실제 캡처 한 장을 유지한다. 최종 구간은 원본 PNG와 GIF 디코딩 결과 모두 동일해 정지 화면의 작은 합성 차이가 반복되지 않는다.

## 사진 출처

[engin akyurt의 피부 관리 사진](https://unsplash.com/photos/woman-lying-on-blue-towel-with-white-cream-on-face-g-m8EDc4X6Q)을 사용했다. 공식 사진 페이지에서 무료 Unsplash License 적용을 확인했다. [라이선스](https://unsplash.com/license)와 출처는 `photo-source.json`에 기록하고 검토 화면에도 표기했다. 의료기관·환자·치료 결과를 증명하는 자료로 쓰지 않았다. 이미지 생성·인물 수정은 하지 않았다.

## 검증과 범위

한국어·확대된 언어 메뉴·English 선택·영어 최종 화면을 캡처하고 GIF 주요 프레임을 시각 검수했다. 실제 언어 클릭 이벤트로 로고 보조 문구·메뉴·제목·설명·예약 버튼·진료 항목·사진 대체텍스트가 전환된다. 사진 로드와 디코딩을 기다린 뒤 80프레임을 캡처한다. FFprobe로 4초·80프레임, GIF 무한 반복과 마지막 30프레임 일치를 확인했다.

외부 HTTPS 검토·목록·GIF·MP4·포스터·사진은 HTTP 200이고 로컬 원본과 바이트가 일치한다. 390px 모바일 브라우저에서 문서 폭 390px·이미지 폭 350px·가로 넘침 없음, 하단 링크 높이 44px, 재생/정지·목록→검토→뒤로가기를 확인했다. 실제 휴대폰 5G 테스트는 하지 않았다. Ego139의 검토 탭을 사용자에게 keep했다.

기존 정적 서버 127.0.0.1:18952 / exec28022와 터널 exec20207, 검토 주소를 유지했다. 맥·서버·터널이 실행 중일 때 사용하는 임시 공유 주소다. 새 서버·터널은 만들지 않았다. 공유 루트에는 검토 HTML·목록·샘플 HTML·사진·GIF·MP4·포스터만 복사했다. 스크립트·메타데이터·저장소/API를 공유하지 않았다.

## 저장과 재현

소스는 `docs/research/hospital-language-switch-browser-20261125/`다. 작동 샘플 `sample.html`, 캡처 `capture-frames.ego.mjs`, 인코더 `encode-media.py`, 검증 `metadata.json`, 사진 출처 `photo-source.json`을 함께 보관한다. 캡처 스크립트는 같은 정적 서버와 Ego139를 사용하며 `/tmp/blinkad-language-switch-browser-frames-20261125/`에 저장한다. 이어서 기존 venv Python으로 인코더를 실행한다. 패키지를 새로 설치하지 않았다.

로컬 읽기본은 `~/Documents/Claude Code/outputs/hospital-language-switch-browser-20261125/`다. 소스 저장소 `happyhappy82/blinkad`의 `erp/insight-higgsfield-plan-20261124` 문서 브랜치에만 저장한다. 기존 `erp/*` 자동 Git 미리보기 제외 설정을 유지했다. **main 병합·공식 홈페이지 배포·인사이트 원문 수정은 하지 않았다.** 기존 지도 문의 글의 공식 GIF와 이전 AI 생성 언어 전환 GIF도 수정하지 않았다. 다음은 형님 검토 후 요청 범위에서 수정하거나 다국어 홈페이지 글 본문에 적용하는 일이다.
