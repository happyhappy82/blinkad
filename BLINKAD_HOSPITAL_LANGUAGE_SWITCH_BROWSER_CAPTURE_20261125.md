# 병원 홈페이지 언어 전환 — 실제 웹 화면 캡처 GIF

제작일: 2026-11-25 KST. 상태: 추가 제작·검토 완료. 공식 글 적용 전.

[모바일 검토 화면](https://shoes-adopt-pushed-humanities.trycloudflare.com/language-switch-browser/preview.html) · [GIF 원본](https://shoes-adopt-pushed-humanities.trycloudflare.com/language-switch-browser/language-switch.gif)

기존 검토용 서버와 터널을 재사용했다. 맥·정적서버·터널 실행 중에 열리는 임시 HTTPS 주소다. 기존 지도 글 검토 주소는 그대로 유지한다.

## 사용자 요청과 결과

형님은 AI 느낌을 줄이는 방법을 물은 뒤, 실제로 동작하는 샘플 홈페이지를 만들고 화면을 촬영하는 방식의 제작을 요청했다. 앞서 지정한 ‘한국어 홈페이지 → 언어 메뉴 확대 → English 선택 → 같은 구성의 영어 홈페이지’와3~5초 조건을 유지했다.

가상의 SAMPLE CLINIC을 HTML/CSS로 작성했다. 언어 메뉴를 열고 English를 누르면 같은 DOM에서 메뉴·제목·설명·예약 버튼이 영어로 바뀐다. 실제 웹폰트·테두리·아이콘을 브라우저가 렌더링한다. 의료진·환자 사진, 병원 실적, 진료 효과 같은 정보를 넣지 않았다.

실제 브라우저에서 시간별 화면을 캡처해4초 타임라인으로 편집했다. 확대와 커서 이동을 제어하고 실제 메뉴 클릭 이벤트로 언어를 바꾼다. 초기 한국어 화면0.5초와 마지막 영어 화면1.5초는 각각 한 번 캡처한 화면으로 유지했다. 마지막 구간의80프레임 타임라인 중50~79프레임은 원본·GIF디코딩 결과 모두 동일해 정지 구간의 글자·선이 바뀌지 않는다.

- GIF: **960×540 · 4.0초 · 20fps · 80프레임 · 무한 반복**,1,107,380바이트.
- MP4: 같은4초 타임라인,215,540바이트. 향후 웹 삽입 시 선택 가능한 보조 파일이다.
- **Higgsfield/API 생성0회, 추가 크레딧0.** 이전 AI생성 GIF는 이력으로 보존했다.

## 구성과 검증

처음0.5초 한국어 전체 화면을 보여주고, 언어 메뉴를 약2배 확대한다. 한국어/English 메뉴가 열리면 커서가 English를 선택한다. 메뉴가 닫히고 영어로 바뀐 뒤 전체 화면으로 돌아와 잠시 유지한다. 글자와 버튼은 같은 HTML 요소이고 바뀌는 것은 내용이다.

주요 한국어: 진료 안내·의료진·오시는 길·진료 예약. 영어: Care·Doctors·Location·Book a Visit. 제목은 ‘진료부터 방문까지, 필요한 안내를 한곳에.’와 ‘Your guide to care and clinic visits.’를 사용했다.

Ego139에서 실제 언어 선택 클릭과 영어 변경을 먼저 확인했다. 960×540화면의80프레임 타임라인을 캡처하고FFmpeg로GIF/MP4를 만들었다. GIF0/25/32/50/79프레임의글자·선택·확대·영어결과를 시각 검수했다. 초기 줄바꿈 표기와 클릭 직후 커서 위치를 고친 뒤 최종 캡처했다. 정지 화면의 작은 브라우저 합성 차이는 실제 캡처 한 컷을 유지해 없앴다.

외부HTTPS 검토·목록·GIF·MP4·정지이미지200, GIF SHA일치를 확인했다. 390px 모바일 브라우저에서 문서/그림 가로 넘침없음,44px 하단링크,재생/정지·목록→검토→뒤로가기를 확인했다. 실제휴대폰5G테스트는 하지 않았다. 최종 검토 화면을Ego139에keep했다.

## 저장과 재현

[작동 샘플](docs/research/hospital-language-switch-browser-20261125/sample.html) · [브라우저 캡처 스크립트](docs/research/hospital-language-switch-browser-20261125/capture-frames.ego.mjs) · [GIF 인코더](docs/research/hospital-language-switch-browser-20261125/encode-media.py) · [GIF](docs/research/hospital-language-switch-browser-20261125/language-switch.gif) · [MP4](docs/research/hospital-language-switch-browser-20261125/language-switch.mp4) · [검증](docs/research/hospital-language-switch-browser-20261125/metadata.json)

샘플과검토HTML/목록/GIF/MP4/정지이미지만 기존 제한 공유루트 `.insight-gif-share/public/language-switch-browser/`로 복사했다. 캡처스크립트·인코더·메타데이터·저장소/API는 공유하지 않았다. 서버18952/exec28022와터널exec20207을그대로사용하며새서버/터널생성0이다.

현재 캡처 재현은샘플을해당정적루트에복사하고Ego139를확보한뒤 `ego-browser nodejs < docs/research/hospital-language-switch-browser-20261125/capture-frames.ego.mjs`를실행한다. 캡처는 `/tmp/blinkad-language-switch-browser-frames-20261125/`에저장된다. 이어서기존venv Python으로같은폴더의 `encode-media.py`를실행한다. 새로운패키지는설치하지않았다. 원본캡처프레임전문은Git에추가하지않았다.

로컬읽기본은 `~/Documents/Claude Code/outputs/hospital-language-switch-browser-20261125/`다. 이번에는GIF 제작과임시검토공유만완료했다. 공식홈페이지·인사이트원문·기존지도글GIF는수정/배포하지않았다. 사용자최종선택·본문적용전이며기존AI생성본과이번캡처본을함께보존한다.
