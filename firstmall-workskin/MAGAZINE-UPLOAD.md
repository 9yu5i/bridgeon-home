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

## Ownership

| 파일 | 역할 |
| --- | --- |
| `trendypicker-magazine.css` | 홈/리스트/상세/뉴스레터/스크롤 리빌/related 카드 |
| `trendypicker-magazine.js` | iframe 높이, 상세 top 오픈, Popular, Related, 스크롤 리빌 |
| `main/magazine.html` | 홈 셸 + iframe(`perpage=12`) + 탭 + 뉴스레터 |
| `gallery01/index.html` | 홈 리드/카테고리 그리드/Popular |
| `gallery01/view.html` | 상세 셸, Related, 관리 버튼 |
| `board/index.html` | magazine iframe 레이아웃 unlock + CSS 링크 |
| `board/view.html` | magazine 분기 (`boardlistsurl=/main/magazine`) |

## Behavior notes

1. 홈 iframe은 `perpage=12`. `/main/magazine` 을 빈 리다이렉트 파일로 바꾸면 Firstmall이 `Error` 를 냅니다. 홈 셸+iframe을 유지하세요.
2. 카드 클릭은 top 창에서 `/board/view?id=magazine&seq=...`.
3. 리드/Latest는 CSS keyframe. Popular는 스크롤 리빌.
4. 상세 Related는 iframe 리스트 fetch 후 카드 3개.

## Validate

```bash
npm run check:firstmall
```

## Smoke test

1. `/main/magazine` — 히어로/탭/리드/Popular/뉴스레터
2. 카테고리 탭 — 12개 그리드
3. 상세 — Related 3카드
4. 뒤로가기 — iframe이 view에 남지 않고 리스트로 복귀
