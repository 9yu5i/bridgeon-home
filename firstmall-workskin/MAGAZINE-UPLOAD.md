# T.P Magazine — Firstmall upload checklist

실무(테스트 스킨 → 확인 → 운영)에 바로 올릴 때 이 목록만 따르면 됩니다.
`?v=` 쿼리는 붙이지 마세요. 업로드 후 하드 새로고침하세요.

## URLs

| 화면 | URL | 스킨 엔트리 |
| --- | --- | --- |
| Magazine home | `/main/magazine` | `main/magazine.html` |
| Board list (iframe / category) | `/board/?id=magazine` | `board/index.html` → `board/magazine/gallery01/index.html` |
| Article detail | `/board/view?id=magazine&seq=...` | `board/view.html` → `board/magazine/gallery01/view.html` |

## Upload targets (필수)

### Skin (`[skin]/…`)

```text
css/redesign/trendypicker-magazine.css
main/magazine.html
board/index.html
board/view.html
board/magazine/gallery01/index.html
board/magazine/gallery01/view.html
```

### Shared app JS (`/app/javascript/js/…`)

```text
app/javascript/js/trendypicker-magazine.js
→ 서버 경로: /app/javascript/js/trendypicker-magazine.js
```

로컬 워크스킨 경로 `firstmall-workskin/app/javascript/js/trendypicker-magazine.js`를
Firstmall 공통 JS 디렉터리로 올립니다 (mypage/orders JS와 동일).

## Optional (변경 없으면 생략)

```text
board/magazine/gallery01/write.html
board/magazine/gallery01/commentview.html
board/magazine/gallery01/board.css
```

## Ownership

| 파일 | 역할 |
| --- | --- |
| `trendypicker-magazine.css` | 홈/리스트/상세/뉴스레터/스크롤 리빌/related 카드 |
| `trendypicker-magazine.js` | iframe 높이, 상단 이동 상세 오픈, Popular 캐러셀, Related 3카드, 스크롤 리빌, lead 피처 키프레임 |
| `main/magazine.html` | 홈 셸 + iframe(`perpage=100`) + 탭 + 뉴스레터 |
| `gallery01/index.html` | 홈 리드/카테고리 그리드/Popular |
| `gallery01/view.html` | 상세 셸, Related, 관리 버튼 |
| `board/index.html` | magazine iframe 레이아웃 unlock + CSS 링크 |
| `board/view.html` | magazine 분기 (`boardlistsurl=/main/magazine`) |

## Behavior notes (운영 확인용)

1. 홈 iframe은 `perpage=100` (Popular hit 랭킹 풀). 카테고리 리스트는 `perpage=12`.
2. 카드 클릭은 iframe이 아니라 **top** 창에서 `/board/view?id=magazine&seq=...` 로 이동.
3. 상세 Related는 같은 카테고리(없으면 전체)에서 현재 글 제외 후 카드 3개 fetch.
4. 상세 본문 이미지는 호버 줌 없음. Related 썸네일만 호버 줌.
5. 스크롤 리빌: 홈(히어로/탭/보드/뉴스레터) + 상세(Related/뉴스레터). lead 왼쪽 피처는 keyframe.

## Validate before upload

```bash
npm run check:firstmall
```

## Smoke test after upload

1. `/main/magazine` — 히어로/탭/리드/Popular/뉴스레터, lead 카드 등장 애니메이션
2. 카테고리 탭 — 12개 그리드, 카드 클릭 시 상단 상세
3. 상세 — 분류(Array 아님), Related 3카드, 썸네일 호버, 뉴스레터 스크롤 리빌
4. 브라우저 뒤로가기 — `/main/magazine` iframe이 view에 남지 않고 리스트로 복귀
