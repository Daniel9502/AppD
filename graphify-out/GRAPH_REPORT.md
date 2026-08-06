# Graph Report - app D  (2026-08-02)

## Corpus Check
- 4 files · ~9,296 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 102 nodes · 211 edges · 11 communities (10 shown, 1 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `aac0dbcc`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- script.js
- initCompose
- buildInvite
- make-icons.js
- initInvite
- Hai să ne vedem 🌙
- initTheme
- buildUrl
- startSky
- initSky
- sw.js

## God Nodes (most connected - your core abstractions)
1. `initCompose()` - 18 edges
2. `initInvite()` - 14 edges
3. `openReply()` - 10 edges
4. `buildInvite()` - 9 edges
5. `toast()` - 9 edges
6. `applyPreset()` - 9 edges
7. `isoOffset()` - 8 edges
8. `buzz()` - 8 edges
9. `buildReply()` - 7 edges
10. `initAnswer()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `openReply()` --indirect_call--> `renderReplyPreview()`  [INFERRED]
  script.js → script.js  _Bridges community 2 → community 1_
- `renderPresets()` --references--> `PRESETS`  [EXTRACTED]
  script.js → script.js  _Bridges community 0 → community 1_
- `renderTip()` --calls--> `tipPoolFor()`  [EXTRACTED]
  script.js → script.js  _Bridges community 4 → community 1_
- `recall()` --references--> `KEYS`  [EXTRACTED]
  script.js → script.js  _Bridges community 7 → community 1_
- `initInvite()` --calls--> `buildUrl()`  [EXTRACTED]
  script.js → script.js  _Bridges community 7 → community 4_

## Import Cycles
- None detected.

## Communities (11 total, 1 thin omitted)

### Community 0 - "script.js"
Cohesion: 0.09
Nodes (21): RFC-5545, ANSWER_TITLES, chipEl(), composeGroups, composeSyncs, counterSyncs, flies, HOURS (+13 more)

### Community 1 - "initCompose"
Cohesion: 0.24
Nodes (17): applyPreset(), buzz(), dateItems(), ensureFuture(), hourItems(), initCompose(), isoOffset(), nextSaturday() (+9 more)

### Community 2 - "buildInvite"
Cohesion: 0.21
Nodes (14): buildIcs(), buildInvite(), buildReply(), confetti(), countdownText(), downloadIcs(), eventDate(), initAnswer() (+6 more)

### Community 3 - "make-icons.js"
Cohesion: 0.22
Nodes (13): chunk(), clamp01(), cover(), crc32(), CRC_TABLE, dist(), draw(), encodePng() (+5 more)

### Community 4 - "initInvite"
Cohesion: 0.24
Nodes (10): copyText(), initInstall(), initInvite(), initServiceWorker(), otherSide(), renderGuestTip(), shareOrCopy(), tipPoolFor() (+2 more)

### Community 5 - "Hai să ne vedem 🌙"
Cohesion: 0.29
Nodes (6): Ce e înăuntru, Cum funcționează, Dezvoltare, Fișiere, Hai să ne vedem 🌙, Publicare

### Community 6 - "initTheme"
Cohesion: 0.50
Nodes (4): applyTheme(), autoTheme(), initTheme(), stopSky()

### Community 7 - "buildUrl"
Cohesion: 0.67
Nodes (4): buildUrl(), KEYS, readUrl(), RKEYS

### Community 8 - "startSky"
Cohesion: 0.67
Nodes (4): drawSky(), skyFrame(), spawnShot(), startSky()

### Community 9 - "initSky"
Cohesion: 0.67
Nodes (3): initSky(), makeGlow(), makeStars()

## Knowledge Gaps
- **30 isolated node(s):** `OPTIONS`, `HOURS`, `JOKES`, `REPLY_CLOSERS`, `TIPS` (+25 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `initCompose()` connect `initCompose` to `script.js`, `buildInvite`, `initInvite`, `buildUrl`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **Why does `initInvite()` connect `initInvite` to `script.js`, `initCompose`, `buildInvite`, `buildUrl`?**
  _High betweenness centrality (0.006) - this node is a cross-community bridge._
- **What connects `OPTIONS`, `HOURS`, `JOKES` to the rest of the system?**
  _30 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `script.js` be split into smaller, more focused modules?**
  _Cohesion score 0.08695652173913043 - nodes in this community are weakly interconnected._