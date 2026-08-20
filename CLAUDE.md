# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A single-file, offline, bilingual (English/Hindi) kids learning web app for a young child to learn the alphabet, numbers, animals/birds/colors, and vehicle names. There is no build system, no package manager, no framework, and no test suite — the entire app is [kids-learning.html](kids-learning.html) (HTML + inline `<style>` + inline `<script>`), meant to be opened directly in Google Chrome by double-clicking the file.

## Running / testing changes

There is no build or dev server. To try a change, just open `kids-learning.html` in Chrome (voice input requires Chrome specifically — `SpeechRecognition` is Chrome-only; `speechSynthesis` works more broadly). There is no automated test suite, so verify changes manually by clicking through the affected screen(s).

## Architecture

Everything lives in one file, organized into numbered sections inside the `<script>` block (search for `/* === N. SECTION === */`):

1. **Language/translations** — `I18N` (UI strings) and `SAY` (spoken sentences, as functions so names/letters can be interpolated) dictionaries, keyed by `en`/`hi`. `LANG` is the current language global; `t(key)` looks up a UI string, `applyI18n()` re-renders all `[data-i18n]` elements.
2. **Data** — content arrays: `ALPHABET` (A–Z → word + emoji/image), `NUMBERS` (1–10 → object + emoji), `CAR_IMAGES`/vehicle SVG generators (cars & bikes theme), `WORD_SFX` (onomatopoeia per animal word), `QUIZ` (animals/birds/colors with accepted spoken answers).
3. **Voice out** — wraps `SpeechSynthesis`. Several tuned voice functions exist for different characters: `speak` (normal), `speakChild`/`speakSlow` (high-pitch "little girl" character voice, via `pickFemaleVoice`), `speakLow` (deep "animal" voice for sound effects).
4. **Sounds** — `Web Audio API` synthesized reward chimes, buzzes, claps/cheers (`noiseBurst`), and an engine "vroom" — all generated in-code, no audio files required.
5. **Navigation** — `show(id)` swaps which `.screen` div is `.active`; `history[]` array backs the Back button.
6–7. **Greeting & main menu routing** — collects the child's name, routes `data-go` buttons to the right mode (`ani` → quiz, `gallery` → Picture Show, `cars` → themed alphabet play, `alpha`/`num` → mode-select screen).
8–9. **Mode select & Play screen** — shared logic for the alphabet/numbers "press the key" games. `playMode` is `'A'` (watch & find the correct key) or `'B'` (press any key to explore). `theme` (`'plain'` or `'cars'`) swaps in the driving-vehicle presentation (`renderCar`, `carCelebration`) instead of the plain letter card. `handlePlayKey` is the single entry point for both the physical keyboard (`keydown` listener) and the on-screen helper keyboard (`showKeyboard`, shown after `FAIL_HELP` wrong tries).
10. **Animals/Birds/Colors quiz** — uses `SpeechRecognition` (Chrome-only; gracefully degrades with a message if unavailable) to check spoken answers against each `QUIZ` item's `accept[]` list via `checkAnswer`/`normalize`.
10b. **Picture Show** — a local-folder slideshow. Uses `<input type=file webkitdirectory>` so the user picks the local `images/` folder (no server, no upload); files are grouped into categories by their immediate subfolder (`fileKind`, `openFolder` handler), then played as a randomized slideshow (`startSlideshow`/`showCurrentSlide`) with random CSS entrance/exit animations (`ENTRANCES`/`EXITS`) and optional background audio tracks found in the same folder.
11–12. **Language toggle & init** — `langBtn` flips `LANG` and re-renders the current screen in place.

Celebration overlays (`rainCelebration`, `rainOver`) are shared full-screen effects: falling emoji/letters/pictures plus a speaking "little girl" character (`speakChild`), used both by the plain alphabet/number games and the cars theme.

## Content conventions

- **Adding/editing vocabulary**: extend `ALPHABET`, `NUMBERS`, or `QUIZ` arrays in section 2 — each entry needs both `en` and `hi` fields kept in sync, since nothing falls back automatically between languages.
- **Images**: search for `[[ ADD IMAGE HERE ]]` markers. Any `img` field can be a plain emoji string or an `http(s)` URL — `renderPic()` auto-detects by checking for an `http` prefix and swaps between `textContent` and an `<img>` tag.
- **Sounds**: search for `[[ ADD SOUND HERE ]]` markers. Real audio files can be dropped in via an `audio:` URL field (see `QUIZ` items or `playCreatureSound`); otherwise sound effects are synthesized speech (`WORD_SFX`, `q.say`) or Web Audio tones.
- **The `images/` folder** (`animals/`, `birds/`, `cars/`, `family/`, `freedom fighters/`, `gods/`, `others/`) is user-supplied content for the Picture Show feature, selected at runtime via the folder picker — it is not referenced directly by path in the HTML/JS.
