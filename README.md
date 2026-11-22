# Cinderwick — A Duel of Three Lanes

[![make.fun](https://make.fun/badge/best-card-game-20261122-1826.svg)](https://make.fun/bounty/best-card-game-20261122-1826)
[![rank](https://make.fun/badge/best-card-game-20261122-1826/WuYuanJie-211/best-card-game-20261122-1826/rank.svg)](https://make.fun/bounty/best-card-game-20261122-1826)
[![reward](https://make.fun/badge/best-card-game-20261122-1826/WuYuanJie-211/best-card-game-20261122-1826/reward.svg)](https://make.fun/bounty/best-card-game-20261122-1826)

Cinderwick is an original two-player card duel over three lanes — the Kiln, the Hollow, and the Tide — built for the [make.fun best card game bounty](https://make.fun/bounty/best-card-game-20261122-1826).

## The game

- **Shared 36-card deck**, four suits (Flame ▲, Frost ◆, Bramble ❋, Gloam ●) at values 1–8, plus four Ember Wilds (✶).
- **15 Wick** each. Each round both players refill to five cards and place two each — you cannot cover all three lanes, so every placement is a bet on which lane you concede.
- **Combos** (highest only, never stacked): Bond +4 (same suit), Ladder +5 (consecutive values), Twin +6 (equal values). An Ember Wild copies the other card's suit for a Bond but adds 0.
- **Burn** once a round to bank Heat equal to a discarded card's value; **Surge** spends 4 Heat for one extra placement.
- **Kindled lane**: one lane each round glows and deals double damage.
- **The Wickkeeper** announces his strongest lane every round and always plays his highest card there first — gift him that lane and win the other two.

## Play

Open `game/index.html` in desktop Chrome (or serve `game/` with any static server). No build step, no network requests, system fonts only, all graphics inline SVG or CSS.

Screenshots are taken with `?shot=title|table|win|loss` URL flags that jump straight to each screen with a seeded state.

## Layout

- `game/index.html` — shell, mount points, script order
- `game/css/table.css` — 1280×720 stage, felt, lanes, HUD grid
- `game/css/cards.css` — faces, backs, suits, ribbons
- `game/css/motion.css` — every animation and its reduced-motion counterpart
- `game/js/cards.js` — deck construction, shuffle, card model, suit metadata
- `game/js/rules.js` — legal moves, combo detection, round scoring, damage, match end
- `game/js/ai.js` — placement heuristic, burn rule, temper line text
- `game/js/ui.js` — pure state-to-DOM rendering of hands, lanes, HUD
- `game/js/anim.js` — FLIP-style move helper, deal stagger, combo flare, win burst
- `game/js/screens.js` — title, table, win, loss routing
- `game/js/main.js` — state machine, click wiring, round and match flow

## License

MIT — see [LICENSE](LICENSE).
