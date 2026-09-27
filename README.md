# BidNorth

**Know if you are ready before you bid.**

BidNorth is a pre-bid readiness check for Canadian small businesses. It checks a tender against declared business evidence, catches disqualifiers early, and shows what must be fixed before proposal work begins.

It is deliberately not a tender-discovery, proposal-writing, partner-marketplace, or win-probability product. BidNorth does not predict awards or submit bids.

## The demo journey

1. Open `/about` (the root route redirects here).
2. Select **See a sample readiness check** to open the flagship energy-efficiency tender in one click.
3. Review **Fix gaps before committing proposal resources** and the **Bid Readiness Ledger**.
4. Expand a requirement to inspect company evidence, status reasoning, the **Sample requirement reference**, and next action.
5. Open the readiness plan, assign the suggested owners, track tasks, and copy the plan.

Northern Grid Solutions is a fictional 18-person Ontario company. Registration and professional liability insurance are verified against its declared profile; project-reference evidence is missing, and security applicability needs human review. Sample mode preserves any saved company profile. Returning users can open `/overview`.

## Timed video demo

Run the app and open [localhost:3000/demo](http://localhost:3000/demo) at a desktop recording size, ideally 1440×900 or 1920×1080. The page stays still until **Start demo** is pressed. The 4:30 cue schedule follows the recorded audio: introductions on the hero (0:00–0:05), problem and sample ledger (0:05–0:26), Canadian figures (0:26–1:03), insight and product preview (1:03–1:30), fictional sample tender and readiness result (1:30–2:00), proof checklist and missing project evidence (2:00–2:30), security human review (2:30–2:53), readiness plan (2:53–3:20), Coach (3:20–3:40), roadmap validation, pilots, and the Canadian businesses statement (3:40–4:26), and the BidNorth closing frame (4:26–4:30). Recording mode hides the unscripted Mission, proof transition, and problem panels between the hero and Canada figures; the regular About page still shows them. The bottom-right controls are visible before Start and hide as soon as playback begins. Press **K** to show or hide them during playback, including on the closing frame. **Restart** or **R** begins again at the About hero.

The recording uses the fixed sample company and local Coach guidance. It does not request AI analysis or use a saved company profile. The controls and focus cues only appear in video mode. Edit timestamps, routes, targets, scrolling, and actions together in `src/lib/video-demo-scenes.ts`. The controller is in `src/components/video-demo-controller.tsx`; each page target has a stable `data-demo` attribute. Reduced-motion settings switch scrolls and transitions to instant changes while preserving the same schedule.

To check narration alignment, press **K** to reveal the controls, enter a time such as `2:53` (or `173` seconds) in **Jump to time**, and press **Jump**. This works before starting and during playback. It opens the correct page and requirement or plan state, moves directly to that scene, then continues on the fixed schedule with the controls hidden again. Jumping backward resets the later state. Enter `0:00` or press **Restart** to play from the beginning; after the closing frame, press **R** to restart.

## Run locally

Requires Node.js 20.9+ (Node 22 recommended).

```bash
npm install
npm run dev
```

Open [localhost:3000](http://localhost:3000). The default workspace is Northern Grid Solutions, an illustrative 18-person Ontario company.

```bash
npm run build
npm start
```

## Readiness model

`calculateMatch(company, tender)` in `src/lib/matching.ts` is pure and deterministic. It calculates supporting context from capability coverage, mandatory requirements, company evidence, and operational readiness. The readiness outcome is gated by mandatory requirements:

- **Do not commit proposal resources yet**: any mandatory requirement is a **Hard stop**.
- **Fix gaps before committing proposal resources**: a mandatory item has **Missing evidence** or **Needs human review**.
- **Ready to prepare a bid**: every mandatory item is **Verified** against the declared profile.

The secondary score cannot override these gates. Verified means matched to the declared profile, not independently certified. Unknown requirements require human review.

## Readiness Coach

With `DEEPSEEK_API_KEY` in `.env.local`, the optional Readiness Coach calls DeepSeek’s chat API with JSON output, a 12-second timeout, and server-side key handling. It only explains:

- what is verified;
- what evidence is missing;
- what must be checked in the original tender; and
- the next practical action.

Responses are restricted to approved, source-grounded guidance. Novel claims are rejected. If no key is configured or an AI response is unavailable, the app provides deterministic local guidance. The coach is never allowed to imply a chance of winning.

## Demo data and sources

**This is a Demo tender dataset, not live government data.** The 12 tender records are illustrative, modeled on public procurement notice structures. Titles, buyers, dates, tender numbers, requirements, weights, and section references are demo content, not verified live solicitations. Every in-product reference is labeled **Demo tender record** or **Sample requirement reference**.

Portal links are entry points only:

- [CanadaBuys tender opportunities](https://canadabuys.canada.ca/en/tender-opportunities)
- [Ontario Tenders](https://ontariotenders.app.jaggaer.com/)

Always verify the official procurement documents, amendments, closing time, and submission process before acting.

## Verification

```bash
npx tsc --noEmit
npm test
npm run build
npm run test:e2e
```

The unit suite covers deterministic assessment, readiness gating, hard blockers, missing evidence, fallback guidance, and exported readiness plans.
