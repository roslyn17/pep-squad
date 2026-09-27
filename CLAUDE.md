@AGENTS.md

# Pep Squad

A silly motivation app. You pick a character from "the squad," tell them what you need motivation for, and they give you a pep talk in their own style, out loud. When you finish the task, you tap "I did it!" and the same character reacts.

The tone is playful. The characters should be funny first and motivating second.

## Tech stack

- React Native with Expo (managed workflow), TypeScript, Expo Router for navigation.
- Test in the iOS Simulator (Expo Go, via Xcode) day to day, and check on a real iPhone with Expo Go at milestones: when voices arrive (step 5) and before calling v1 done.
- Voices: `expo-speech` (built-in device text-to-speech) for v1. Each character gets its own pitch and rate. An AI voice service may replace this later, so keep speech behind one small module (e.g. `src/lib/speak.ts`). `expo-speech` can't report clip length, so the play-button durations (e.g. "0:09") are estimated from the word count and the character's speech rate (`estimateDurationSeconds` in `src/lib/speak.ts`).
- AI pep talks: the Anthropic API, called ONLY through a small serverless backend function on Vercel. The backend lives in `backend/` (its own package.json; the function is `backend/api/pep-talk.ts`) and is deployed as the Vercel project **pep-squad-api** at https://pep-squad-api.vercel.app. It reads character personalities from `src/data/characters.ts`, so the app and backend share one character file. The app's backend address is in `src/config.ts`. The API key lives in the backend's environment variables and must never appear in the app code or be committed to git.
- Local storage for saved pep talks, wins, and streaks (e.g. AsyncStorage). No user accounts in v1.
- Fonts: Bricolage Grotesque (headings) and DM Sans (body) via `@expo-google-fonts`.
- Expo SDK 57. App code lives in `src/`: screens in `src/app/` (Expo Router), shared UI in `src/components/`, colors and fonts in `src/theme.ts`. Screens use the tokens in `src/theme.ts` rather than raw color values.

## Screens

1. **Squad (home):** "Squad member of the day" card at the top, then a 2-column grid of the user's squad (the characters they have). Bottom tab bar: Squad, Saved. The settings gear shown in the mockup is not in v1.
2. **Pep talk:** character header (icon, with the name and the tagline stacked beside it), text input ("What do you need a push for?"), 3-tier intensity selector (Gentle / Fired up / Full chaos), speech bubble with the pep talk and a play button, buttons for Again, Save, Swap, and a big "I did it!" button.
   - Swap opens a picker of the user's squad; choosing a character immediately generates a new pep talk for the same task and intensity.
   - Before the first pep talk, the big bottom button reads "Pep me up!" (enabled once a task is typed). After a pep talk arrives it becomes "I did it!", and the pep talk plus Again / Save / Swap appear.
   - Intensity defaults to Fired up. Tasks are capped at 120 characters.
3. **I did it!:** a full-screen dark page (`src/app/victory.tsx`) with "Mission complete", the task as the title, the character, their reaction (with play button, auto-plays), current streak and progress toward the next unlock (added in step 8), and "Back to the squad". The close X and "Back to the squad" both return to the Squad tab. The character's face stays the same as on the other screens. When this win reaches an unlock, show the unlock choice (see Characters).
4. **Saved:** saved pep talks as cards (character, task, intensity, snippet, play button), with filter chips by character.

Wins and streaks are still recorded in v1 because the "I did it!" screen shows the streak and unlock progress, and unlocks happen every 10 wins. A streak is the number of consecutive days with at least one win, using the phone's local time.

## Characters

All character data lives in ONE file (`src/data/characters.ts`) so adding or tweaking characters never requires touching screen code. Each character has: id, name, role (e.g. "Drill sergeant"; not shown in the app, kept as extra context), one-line tagline, placeholder icon, card color, tone tag, personality prompt, voice settings (a ranked list of preferred iPhone voices, plus pitch and rate), failure lines, and daily-limit lines.

### Character system

- The bank has 20 characters total. Each character has a tone tag: gentle, loud, chaotic, or deadpan.
- On first launch, the app randomly assigns 5 starting characters, with at least one of each tone. Store the squad on the device (still no accounts in v1).
- Every 10 wins, the user unlocks a new character by choosing 1 of 3 random characters they don't have yet. The 2 they don't pick go back into the pool.

### Character bank

- **Sergeant Stone** (loud): drill sergeant, yells in all caps, gets emotional when you succeed.
- **Grandma June** (gentle): endlessly proud, always wants you to eat something.
- **Biscuit** (chaotic): golden retriever, thrilled about everything, including nothing.
- **Sir Reginald** (chaotic): Shakespearean actor, treats chores like epic tragedies.
- **Mr. Whiskers** (deadpan): unimpressed cat, grudgingly admits you did fine.
- **Lady Ashworth** (deadpan): disappointed Victorian ghost, quietly thrilled when you prove her wrong.
- **Captain Barnacle** (loud): pirate who treats tasks as treasure hunts.
- **Unit 7** (deadpan): overly literal robot who calculates your odds of success.
- **Brody** (gentle): extremely chill surfer.
- **Queen Marigold** (loud): issues royal decrees commanding you to do your task.
- **Madame Zora** (chaotic): fortune teller with dramatic, vague predictions.
- **Kevin from Accounting** (deadpan): speaks only in corporate jargon.
- **The Narrator** (deadpan): nature documentary voice observing you in your habitat.
- **Gerald** (gentle): patient houseplant who relates everything to sunlight and water.
- **Baron Von Procrastin** (chaotic): villain who wants you to fail, so doing the task foils his plan.
- **Coach Dale** (loud): sports commentator calling your task play by play.
- **Toddler Tess** (chaotic): huge hype, endless "but WHY?" questions.
- **Future You** (gentle): you from five years from now, grateful and slightly cryptic.
- **Commander Nova** (loud): mission control, treats tasks like rocket launches.
- **Chef Antoine** (chaotic): dramatic chef, treats tasks like dishes that must not be ruined.

## AI prompting

- Each request sends: the character's personality prompt, the user's task, and the intensity tier.
- Two kinds of responses: a pep talk (before the task) and a reaction (after "I did it!").
- Keep responses short (2 to 4 sentences) so they're fun to hear aloud.
- Characters stay kind underneath the comedy: never genuinely insulting or mean about the user.
- Use Claude Haiku 4.5 and cap response length with `max_tokens`.
- The backend enforces a limit of 20 AI requests per day per device (pep talks and reactions combined), using an anonymous ID the app generates on first launch. Because that ID can be reset by reinstalling, the backend also enforces a global daily cap of 100 requests across all users; this is the real cost protection. Change it with the `GLOBAL_DAILY_LIMIT` environment variable in Vercel (no code change needed). Days reset at midnight UTC. Counters live in Upstash for Redis (free plan, connected to the Vercel project). When the limit is hit, show a friendly in-character message instead of an error.
- When an AI call fails (no internet, server error), tell the user it failed using a pre-written, in-character line. Each character has its own failure lines and daily-limit lines in `src/data/characters.ts`. After a failure, the big button reads "Try again". Never show a fake pep talk as if the AI wrote it.
- Replaying a saved pep talk never makes a new AI call.

## Design

The mockup is `docs/PepSquadMock.pdf`. Where it differs from this file (the "See all 8" count, the settings gear, the Progress tab), this file wins.

- Background: warm cream `#FBF6EE`. Text: `#1F1B16`. Secondary text: `#6B6259`.
- Accent: tomato orange `#C2410C` (primary buttons, active tab). Gold `#F4C56A` on dark surfaces.
- Dark surfaces (victory screen, featured card): `#1F1B16`.
- Rounded cards (about 20px radius), generous padding, touch targets at least 44px.
- Characters use a placeholder icon (from MaterialCommunityIcons) in a soft circle until drawn faces exist. All avatars go through `src/components/CharacterAvatar.tsx`, so swapping in faces later only touches that file.

## Build order

Build one step at a time. Each step should work in Expo Go in the iOS Simulator before moving on.

1. ✅ Expo project setup, fonts, colors, tab navigation with empty Squad and Saved tabs.
2. ✅ Character data file (all 20), first-launch squad assignment, and the Squad screen grid.
3. ✅ Pep talk screen UI with a hard-coded sample response.
4. ✅ Serverless backend function and real AI pep talks.
5. ✅ Voice playback with `expo-speech`.
6. ✅ "I did it!" screen with the AI reaction (auto-play voice).
7. Saving pep talks and the Saved tab.
8. Recording wins and streaks (shown on the "I did it!" screen).
9. Nice-to-haves: squad member of the day, unlocking characters (choose 1 of 3), haptics, notifications.

## Working rules

- Keep changes small and focused on the current build step.
- Ask before adding new dependencies.
- Commit to git after each working step.
- Never put API keys or secrets in the app code.

## Keeping this file current

This file is the source of truth for the project. Update it whenever something changes:
- When a decision is made (new feature, removed feature, new character, design change), edit the relevant section.
- When a build step is finished, mark it done in the build order.
- Add a short "Decisions" entry below for anything that isn't obvious from the rest of the file.
- Propose CLAUDE.md edits at the end of a work session, and make them once the user agrees.

## Future features

Not in v1, but planned or worth considering:

- **User accounts:** sign-in so a user's squad, wins, and saved pep talks sync across devices and survive reinstalling. This would allow true per-person AI limits. When added, upload the data already on the phone at sign-up so nobody loses progress. Until then, keep all stored data in one clearly organized place (e.g. a single `src/lib/storage.ts` module) so it's easy to sync later. Apple requires in-app account deletion, and Sign in with Apple if any other social sign-in is offered.
- **Sharing:** "Share this moment" from the victory screen (removed from v1).
- **Settings screen:** the gear shown in the mockup.
- **Progress tab:** streak, wins this week (bar chart by day), top motivator, next unlock, and recent wins (page 5 of the mockup). Wins are already recorded in v1, so this is mostly a new screen.
- **Drawn character faces:** replace the placeholder icons with simple drawn faces in the mockup's style.
- **AI voices (planned for a future version):** replace the built-in iPhone voices with an AI voice service (e.g. ElevenLabs or OpenAI text-to-speech) so characters sound genuinely excited, deadpan, or dramatic instead of monotone. Plan:
  - Generate audio in the backend (like the AI text), so the voice service's API key stays server-side, and give each character a matching AI voice.
  - Cache/store the audio for saved pep talks so replays never pay again.
  - Expect a short delay before playback and a per-clip cost (likely a few cents); count voice requests against the daily limits too.
  - Only `src/lib/speak.ts` should need to change on the app side; keep the built-in voices as the fallback when the voice service fails.

## Decisions

- Mobile app with Expo rather than a web app.
- Intensity uses 3 tiers, not a slider.
- "Swap" button label kept for now; may rename later if it confuses people.
- 20 AI requests per day limit to keep costs under about $1/month.
- Bank of 20 characters, each tagged gentle, loud, chaotic, or deadpan. Each user starts with 5 random characters, including at least one of each tone.
- One unlock every 10 wins: the user picks 1 of 3 random characters they don't have yet; the other 2 go back into the pool.
- No sharing in v1: "Share this moment" was removed from the spec and the mockup.
- No settings screen in v1, even though the mockup shows a settings gear.
- When the AI fails, show an honest in-character failure line, not a pre-written pep talk.
- "I did it!" requires a pep talk first.
- Swap opens a squad picker and generates a new pep talk right away.
- Streak = consecutive days with at least one win, using the phone's local time.
- Voice clip durations are estimated from the text length.
- The character's face doesn't change on the victory screen.
- Backend is a Vercel function in `api/` in this repo.
- Test in the iOS Simulator day to day, since it's faster to iterate; check on a real iPhone at milestones for voices, haptics, and how buttons feel under a thumb.
- No user accounts in v1: all data stays on the phone (AsyncStorage). This is simpler and faster to build, has no sign-up friction, and keeps data private. The trade-off is that data doesn't survive deleting the app or move to other devices, and per-device AI limits can be dodged, hence the global daily cap. Accounts are listed under Future features.
- No Progress tab in v1: the tab bar is just Squad and Saved. Wins and streaks are still recorded for the victory screen and unlocks. The Progress tab is listed under Future features.
- App code lives under `src/` (Expo's default layout), so paths like `data/characters.ts` in this file mean `src/data/characters.ts`. `AGENTS.md` holds Expo's own guidance for AI assistants and is imported at the top of this file.
- Tone groups are uneven (gentle 4, loud 5, chaotic 6, deadpan 5), so gentle characters show up in starting squads a bit more often. That's fine.
- Placeholder avatars are icons, not emoji: emoji don't render in the iOS Simulator (they show as "?" boxes). Drawn faces are a future feature.
- The Squad screen has a dashed "Dev only: re-roll my squad" button for testing the random starting squad. It only appears in development (`__DEV__`), never in the real app.
- `react-dom` is installed only to satisfy Expo's peer dependencies (npm otherwise fails to install packages). It's used for web, not the iPhone app.
- The mockup doesn't show the pep talk screen before a pep talk exists, so a "Pep me up!" button fills that slot until the first pep talk, then turns into "I did it!".
- All pep talk requests go through `requestPepTalk()` in `src/lib/pepTalk.ts`. In step 3 it returns a clearly labeled sample; step 4 swaps in the real AI call without screen changes.
- Character roles aren't displayed in the app (the name and tagline say enough). The `role` field stays in the data as extra context.
- Backend lives in `backend/` rather than a top-level `api/` folder, so Vercel doesn't install the whole iPhone app or serve project files as a website. The Vercel project's Root Directory is `backend` with "include files outside the root directory" on, so it can read `src/data/characters.ts`.
- The Anthropic API key is stored in Vercel as a Secret environment variable (`ANTHROPIC_API_KEY`). It never appears in the app, the repo, or chat.
- Upstash added two reference guides for AI assistants in `.claude/skills/` (and `.agents/skills/`), tracked by `skills-lock.json`.
- AI responses are capped at 2 to 4 sentences and about 60 words, so they're quick to hear aloud.
- The Anthropic account uses prepaid credits with auto-reload off, so running out stops requests instead of charging more.
- Voices: only one line plays at a time; the play button turns into a stop button while speaking. Speech stops when you ask for a new pep talk, swap, or leave the screen. Pep talks don't auto-play (you tap play); reactions will auto-play in step 6.
- All-caps lines (Sergeant Stone) are spoken in normal case, because text-to-speech reads some capitalized words as letters ("IT" as "I T"). The screen still shows them in caps.
- Voices respect the iPhone's silent switch: when the phone is on silent, nothing plays (including auto-played reactions). This is intentional; don't add a "play in silent mode" override.
- Each character has a ranked list of preferred built-in iPhone voices (accents like British Daniel or Irish Moira, novelty voices like Zarvox for Unit 7, and a French voice for Chef Antoine). The app uses the first one the phone has, preferring an Enhanced/Premium download of it, and falls back to the default voice. Which voices exist varies by iPhone and by what the user has downloaded in Settings > Accessibility > Spoken Content > Voices.
- The pep talk screen keeps its big button above the on-screen keyboard, and the keyboard's "done" key asks for the first pep talk, so you don't have to dismiss the keyboard first.
- Simulator testing quirk: the Simulator's automated typing is slow, so taps sent right after typing can land late. This isn't an app bug.
