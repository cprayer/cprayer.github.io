# About page external source archive

Captured on 2026-09-24 (UTC). Open each **complete page** directly in a browser; its visible content, styles, fonts, and images are contained in one HTML file. These files preserve the external evidence linked from the competitions section of `src/pages/about.tsx`. They are kept outside `static/`, so they are not published on the site; the live links in About have not been changed.

| About entry | Original URL | Complete page | Raw source/data |
| --- | --- | --- | --- |
| 2018 Seoul Regional | https://icpckorea.org/2018-seoul/regional | [Open snapshot](icpc-seoul-2018-complete.html) | `icpc-seoul-2018.html` |
| 2017 Daejeon Regional teams | https://icpckorea.org/2017-daejeon/regional/teams | [Open snapshot](icpc-daejeon-2017-teams-complete.html) | `icpc-daejeon-2017-teams.html` |
| Google Code Jam 2020 and 2021 | https://zibada.guru/gcj/profile/cprayer | [Open snapshot](gcj-cprayer-complete.html) | `gcj-cprayer.html`, `gcj-assets/` |
| Kakao Code Festival 2018 final | https://t1.kakaocdn.net/codefestival/2018-round-2-scoreboard/index.html | [Open snapshot](kakao-2018-complete.html) | `kakao-2018-scoreboard.html`, `kakao-2018-config.js`, `kakao-2018-contest.json`, `kakao-2018-runs.json` |
| Kakao Code Festival 2017 final | https://t1.kakaocdn.net/codefestival/round-2-scoreboard/index.html | [Open snapshot](kakao-2017-complete.html) | `kakao-2017-scoreboard.html`, `kakao-2017-config.js`, `kakao-2017-contest.json`, `kakao-2017-runs.json` |

The complete pages are **frozen visual snapshots**: they open without the original hosts, but JavaScript-driven controls and links to other pages are not mirrored. The Kakao snapshots include all 94 (2017) and 64 (2018) rendered teams. Their original HTML loads standings with JavaScript, so the source `config.js`, `contest.json`, and `runs.json` are also saved. The 2017 Daejeon page is a team list, not a ranking. The Code Jam snapshot was rebuilt from the original HTML and CSS/JS assets with `build-gcj-snapshot.cjs`; its original Roboto regular font did not respond, so the same font family at weight 400 from Google Fonts is embedded instead.

The original 2018 Seoul link includes `#:~:text=choolbal_dream`, a browser text-fragment anchor. This fragment is not part of the downloaded HTML URL. File hashes are in `SHA256SUMS`; verify with `shasum -a 256 -c SHA256SUMS` from this directory. At 1280×800, the 2018 Kakao snapshot produced a screenshot byte-for-byte identical to the live page in Chrome.
