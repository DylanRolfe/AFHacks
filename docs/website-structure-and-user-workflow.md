# BidNorth website structure and user workflow

BidNorth is the pre-bid readiness check for Canadian SMEs: catching disqualifiers before they spend weeks writing a proposal.

## Primary journey

Public landing page -> See a sample readiness check -> Fix gaps result -> Bid Readiness Ledger -> Action plan -> Canadian mission.

- `/` redirects to `/about`, the public landing page without workspace chrome.
- `/about` presents the product, interactive ledger preview, trust principles, mission, and illustrative-data disclosure.
- Its primary CTA opens `/opportunities/energy-retrofit?sample=1` in one click. This uses fictional Northern Grid Solutions without changing the locally saved profile.
- `/overview` is the returning-user dashboard: tenders ready to prepare, tenders requiring evidence, mandatory items at risk, and nearest deadline.
- `/opportunities` retains tender search and filtering.
- `/opportunities/[id]` checks the saved company profile unless sample mode is selected.
- `/profile` retains validated local-storage editing under `bidnorth.company.v1`.
- `/methodology` explains mandatory gates, supporting metrics, and demo sources.

## Deterministic readiness gates

`src/lib/matching.ts` remains the calculation authority. `src/lib/readiness.ts` supplies consistent user-facing labels.

1. A mandatory **Hard stop** yields **Do not commit proposal resources yet**.
2. Mandatory **Missing evidence** or **Needs human review** yields **Fix gaps before committing proposal resources**.
3. All mandatory items **Verified** yields **Ready to prepare a bid**.

The numeric readiness score never overrides these gates. Optional gaps do not block verified mandatory items. Unrecognized requirements require human review. Verified means matched to the declared profile, not independently certified.

The sample verifies Ontario registration, insurance, and delivery coverage. Comparable projects have missing reference evidence; security applicability needs human review. Adding project evidence cannot clear the security review.

## Ledger and action plan

Each expandable ledger row presents requirement text, mandatory designation, status, company evidence, a labeled **Sample requirement reference**, and next action. Expansion explains the status and source context, with a reminder that the original tender remains authoritative.

The drawer prioritizes security and mandatory risks, insurance, project references, and internal compliance review before drafting. Every task has a suggested owner, timing, and session completion state. Drafting remains disabled while mandatory gaps exist. Checking tasks does not verify requirements. Copy plan includes task states and offers selectable text if clipboard access fails.

## Readiness Coach

The coach provides guidance only, never award predictions, legal advice, or legal/procurement eligibility determinations. `/api/bid-coach` validates the profile and recalculates against the canonical tender record. The optional external service receives structured data and approved grounded guidance. Responses must pass schema and exact approved-content validation; novel claims are rejected. Missing/invalid keys, HTTP failures, timeouts, malformed JSON, and unsupported claims use deterministic guidance.

Refreshing the coach may send the company profile to the configured external provider; simply opening a page does not. Keys stay server-side.

## Trust boundaries

All tender titles, buyers, dates, numbers, references, and package metadata are illustrative. Official portal links are entry points, not verified tender links. Production decisions require the complete official package and amendments. BidNorth does not submit bids or predict award outcomes.

## Verification

Run `npx tsc --noEmit`, `npm test`, `npm run build`, and `npm run test:e2e`. Browser tests use port 3107 and a separate `.next-e2e` directory to avoid interfering with a running development workspace.
