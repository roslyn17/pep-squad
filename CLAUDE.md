# Pep Squad

A silly motivation app. You pick a character from "the squad," tell them what you need motivation for, and they give you a pep talk in their own style, out loud. When you finish the task, you tap "I did it!" and the same character reacts.

The tone is playful. The characters should be funny first and motivating second.

## Tech stack

- React Native with Expo (managed workflow), TypeScript, Expo Router for navigation.
- Test on a real phone with Expo Go throughout development.
- Voices: `expo-speech` (built-in device text-to-speech) for v1. Each character gets its own pitch and rate. An AI voice service may replace this later, so keep speech behind one small module (e.g. `lib/speak.ts`). `expo-speech` can't report clip length, so the play-button durations (e.g. "0:09") are estimated from the text length.
- AI pep talks: the Anthropic API, called ONLY through a small serverless backend function on Vercel, kept in an `api/` folder in this repo. The API key lives in the backend's environment variables and must never appear in the app code or be committed to git.
- Local storage for saved pep talks, wins, and streaks (e.g. AsyncStorage). No user accounts in v1.
- Fonts: Bricolage Grotesque (headings) and DM Sans (body) via `@expo-google-fonts`.

## Screens

1. **Squad (home):** "Squad member of the day" card at the top, then a 2-column grid of the user's squad (the characters they have). Bottom tab bar: Squad, Saved, Progress. The settings gear shown in the mockup is not in v1.
2. **Pep talk:** character header, text input ("What do you need a push for?"), 3-tier intensity selector (Gentle / Fired up / Full chaos), speech bubble with the pep talk and a play button, buttons for Again, Save, Swap, and a big "I did it!" button.
   - Swap opens a picker of the user's squad; choosing a character immediately generates a new pep talk for the same task and intensity.
   - "I did it!" is only enabled after a pep talk has been generated.
3. **I did it!:** the character's reaction (with play button, auto-plays), current streak, progress toward the next unlock, and "Back to the squad." The character's face stays the same as on the other screens. When this win reaches an unlock, show the unlock choice (see Characters).
4. **Saved:** saved pep talks as cards (character, task, intensity, snippet, play button), with filter chips by character.
5. **Progress:** streak, wins this week (bar chart by day), top motivator, next unlock, recent wins.
   - A streak is the number of consecutive days with at least one win, using the phone's local time.

## Characters

All character data lives in ONE file (`data/characters.ts`) so adding or tweaking characters never requires touching screen code. Each character has: id, name, one-line tagline, card color, tone tag, personality prompt, and voice settings (pitch, rate).

### Character system

- The bank has 20 characters total. Each character has a tone tag: gentle, loud, chaotic, or deadpan.
- On first launch, the app randomly assigns 5 starting characters, with at least one of each tone. Store the squad on the device (still no accounts in v1).
- Every 10 wins, the user unlocks a new character by choosing 1 of 3 random characters they don't have yet. The 2 they don't pick go back into the pool.

### Character bank

- **Sergeant Stone:** drill sergeant, yells in all caps, gets emotional when you succeed.
- **Grandma June:** endlessly proud, always wants you to eat something.
- **Biscuit:** golden retriever, thrilled about everything, including nothing.
- **Sir Reginald:** Shakespearean actor, treats chores like epic tragedies.
- **Mr. Whiskers:** unimpressed cat, grudgingly admits you did fine.
- **Lady Ashworth:** disappointed Victorian ghost, quietly thrilled when you prove her wrong.
- **Captain Barnacle:** pirate who treats tasks as treasure hunts.
- **Unit 7:** overly literal robot who calculates your odds of success.
- **Brody:** extremely chill surfer.
- **Queen Marigold:** issues royal decrees commanding you to do your task.
- **Madame Zora:** fortune teller with dramatic, vague predictions.
- **Kevin from Accounting:** speaks only in corporate jargon.
- **The Narrator:** nature documentary voice observing you in your habitat.
- **Gerald:** patient houseplant who relates everything to sunlight and water.
- **Baron Von Procrastin:** villain who wants you to fail, so doing the task foils his plan.
- **Coach Dale:** sports commentator calling your task play by play.
- **Toddler Tess:** huge hype, endless "but WHY?" questions.
- **Future You:** you from five years from now, grateful and slightly cryptic.
- **Commander Nova:** mission control, treats tasks like rocket launches.
- **Chef Antoine:** dramatic chef, treats tasks like dishes that must not be ruined.

## AI prompting

- Each request sends: the character's personality prompt, the user's task, and the intensity tier.
- Two kinds of responses: a pep talk (before the task) and a reaction (after "I did it!").
- Keep responses short (2 to 4 sentences) so they're fun to hear aloud.
- Characters stay kind underneath the comedy: never genuinely insulting or mean about the user.
- Use Claude Haiku 4.5 and cap response length with `max_tokens`.
- The backend enforces a limit of 20 AI requests per day per device (pep talks and reactions combined), using an anonymous ID the app generates on first launch. Because that ID can be reset by reinstalling, the backend also enforces a global daily cap on total AI requests across all users; this is the real cost protection. The exact cap is set in step 4. When the limit is hit, show a friendly in-character message instead of an error.
- When an AI call fails (no internet, server error), tell the user it failed using a pre-written, in-character line. Each character has its own failure lines in `data/characters.ts`. Never show a fake pep talk as if the AI wrote it.
- Replaying a saved pep talk never makes a new AI call.

## Design

The mockup is `docs/PepSquadMock.pdf`. Where it differs from this file (the "See all 8" count, the settings gear), this file wins.

- Background: warm cream `#FBF6EE`. Text: `#1F1B16`. Secondary text: `#6B6259`.
- Accent: tomato orange `#C2410C` (primary buttons, active tab). Gold `#F4C56A` on dark surfaces.
- Dark surfaces (victory screen, featured card): `#1F1B16`.
- Rounded cards (about 20px radius), generous padding, touch targets at least 44px.
- Characters are simple drawn faces as placeholders until real art exists.

## Build order

Build one step at a time. Each step should work on a phone in Expo Go before moving on.

1. Expo project setup, fonts, colors, tab navigation with empty Squad, Saved, and Progress tabs.
2. Character data file (all 20), first-launch squad assignment, and the Squad screen grid.
3. Pep talk screen UI with a hard-coded sample response.
4. Serverless backend function and real AI pep talks.
5. Voice playback with `expo-speech`.
6. "I did it!" screen with the AI reaction (auto-play voice).
7. Saving pep talks and the Saved tab.
8. Recording wins, streaks, and the Progress tab.
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

- **User accounts:** sign-in so a user's squad, wins, and saved pep talks sync across devices and survive reinstalling. This would allow true per-person AI limits. When added, upload the data already on the phone at sign-up so nobody loses progress. Until then, keep all stored data in one clearly organized place (e.g. a single `lib/storage.ts` module) so it's easy to sync later. Apple requires in-app account deletion, and Sign in with Apple if any other social sign-in is offered.
- **Sharing:** "Share this moment" from the victory screen (removed from v1).
- **Settings screen:** the gear shown in the mockup.
- **AI voices:** replace `expo-speech` with an AI voice service.

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
- Test device: iPhone with Expo Go.
- No user accounts in v1: all data stays on the phone (AsyncStorage). This is simpler and faster to build, has no sign-up friction, and keeps data private. The trade-off is that data doesn't survive deleting the app or move to other devices, and per-device AI limits can be dodged, hence the global daily cap. Accounts are listed under Future features.
