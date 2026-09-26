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
