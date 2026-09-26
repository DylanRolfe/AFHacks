# BidNorth — One-Shot Build Specification

**Purpose:** This document is the complete implementation brief for an AI coding agent. Build the project in one pass as a polished, demo-ready web application for a 24-hour hackathon.

---

## 1. Product definition

### Product name

**BidNorth**

### Tagline

**Find government contracts your business can actually pursue.**

### One-sentence product description

BidNorth is an explainable AI procurement co-pilot that helps Canadian small businesses discover relevant public tenders, determine whether to pursue, partner, or pass, and prepare a concrete bid-readiness plan.

### The problem

Government contracts can help Canadian small businesses grow, but tender documents are long, requirements are difficult to interpret, and small firms usually do not have a dedicated procurement team. They spend valuable time pursuing unsuitable bids or miss good opportunities entirely.

### The product promise

BidNorth does **not** predict who will win a contract and does **not** submit bids. It helps the user make a faster, better-informed bid/no-bid decision.

For every tender, the app answers:

1. Are we eligible?
2. Are we a credible fit?
3. What evidence or qualification is missing?
4. Should we pursue, partner, or pass?
5. What should we do before the deadline?

### Target user

The primary user is an owner/operator or business-development lead at a Canadian small or medium-sized business (roughly 5–100 employees) that wants to sell to government but lacks procurement expertise.

### Hackathon narrative

Canada’s public procurement market is a major source of demand, yet too many capable Canadian SMEs cannot access it because the process is opaque and labour-intensive. BidNorth makes government procurement more accessible, helping Canadian companies find customers, scale, hire, and compete.

---

## 2. Non-negotiable scope

### Build these

- A polished application shell and landing/dashboard page.
- A pre-filled, editable company profile.
- A list of curated federal and Ontario tender opportunities.
- Dynamic tender matching based on a transparent scoring model.
- Tender detail page with eligibility analysis, fit breakdown, missing evidence, and action plan.
- An AI Bid Coach panel powered by OpenAI when an API key exists.
- A deterministic graceful fallback if the API key is absent or the request fails.
- A proposal-readiness panel that visually simulates review of a short proposal excerpt; this is a stretch feature and must not endanger the core flow.
- A good README, `.env.example`, and sample data.

### Do not build these

- Authentication, accounts, payments, subscriptions, or teams.
- A production database, Supabase, Firebase, Prisma, or migrations.
- Live scraping of CanadaBuys or Ontario Tenders.
- Live login or automated submission to any government portal.
- A vector database, embeddings pipeline, or multi-agent architecture.
- A claim that the product predicts the probability of winning.
- A generic chatbot page disconnected from tender information.
- A crowded analytics dashboard full of meaningless charts.

### Why this scope

The demonstration must feel real, not broad. A reliable end-to-end workflow is more valuable than a collection of partially working features.

---

## 3. Recommended technology

- **Framework:** Next.js 15+ with App Router and TypeScript.
- **Styling:** Tailwind CSS.
- **Components:** Build clean custom components; use shadcn/ui primitives only where they save time.
- **Icons:** `lucide-react`.
- **Animation:** Framer Motion only for subtle entrance, progress, and interaction animations. Do not add excessive motion.
- **Data:** Typed local TypeScript/JSON data in `src/data/`.
- **AI:** OpenAI Responses API invoked from a server route. Use `gpt-6-astra` only when `OPENAI_API_KEY` is present.
- **No database:** Persist profile edits only in React client state and optionally localStorage.

The project must run with:

```bash
npm install
npm run dev
```

If using the AI feature locally, the user creates `.env.local` from `.env.example` and sets `OPENAI_API_KEY`.

---

## 4. Visual and interaction direction

### Desired aesthetic

The interface must feel like a credible, premium B2B product—not a hackathon mockup and not a neon “AI” dashboard.

Use the design language of modern, restrained product sites such as Linear, Ramp, Stripe, and Vercel as directional inspiration only. Do not copy logos, assets, layouts, or proprietary design elements.

### Design principles

- High visual clarity and deliberate whitespace.
- Information dense where needed, calm everywhere else.
- Strong typography hierarchy; no giant marketing text inside the app.
- A warm off-white background, dark ink text, subtle borders, and restrained blue/green accents.
- Cards should have thin borders and a very soft shadow, not glossy gradients.
- Use colour primarily for meaning: green = strong/pursue, amber = watch/partner, red = hard blocker/pass, blue = action/information.
- Use motion only to reinforce state changes: progress fills, a row expanding, a result appearing.
- Make every data point feel intentional. Avoid fake charts or arbitrary percentages.

### Colour tokens

```css
--canvas: #F7F8FA;
--surface: #FFFFFF;
--surface-subtle: #F1F4F7;
--ink: #172033;
--ink-secondary: #5B6678;
--border: #E3E7EC;
--brand: #1F5EFF;
--brand-soft: #EAF0FF;
--success: #16835B;
--success-soft: #E9F8F0;
--warning: #B7791F;
--warning-soft: #FFF6E5;
--danger: #C9473A;
--danger-soft: #FFF0EE;
```

### Typography

- Prefer `Inter` or `Geist` via `next/font`.
- Headings: tight line height, medium-to-bold weight, dark ink.
- Body: 14–16px, generous line height.
- Labels and metadata: 12–13px, medium weight, muted colour.
- Avoid all-caps except very small eyebrow labels.

### Layout

- Desktop-first demo, but responsive down to mobile.
- Max content width around 1280px.
- Left sidebar: 248px on desktop, collapsible on smaller screens.
- Main content uses a 12-column grid with 24px gaps.
- Header is understated: breadcrumb/page title on the left; user/profile chip and subtle action on the right.

### Logo treatment

Create a simple wordmark: a compact four-point north/star mark inside a rounded square followed by `BidNorth`. Do not use a complex illustrated logo. Use the native icon implementation rather than needing an image asset.

---

## 5. Application pages and exact UX

### Shared application shell

Desktop sidebar navigation:

- BidNorth logo
- `Overview` (active initially)
- `Opportunities`
- `Company profile`
- bottom: `Sources & methodology`

Add a small product status label near the bottom: `Demo workspace`.

The sidebar must not dominate the screen. Use a white surface, light right border, and quiet icons.

---

### Page A — Overview dashboard (`/`)

#### Goal

Within 10 seconds, a user should understand their company’s highest-value opportunities and what needs attention.

#### Header copy

Eyebrow: `Good morning, Northern Grid Solutions`

Headline: `Your next government contract is closer than you think.`

Subhead: `We analyzed 12 federal and Ontario opportunities against your verified capabilities.`

Right-side primary button: `Update company profile`

#### Top summary row

Three compact cards:

1. `3` — Strong opportunities — `Ready to pursue this month`
2. `2` — Readiness gaps — `Evidence or qualifications to address`
3. `11 days` — Next closing date — `Energy retrofit services`

#### Main dashboard body

Two columns (8/4 split):

**Left: Best-fit opportunities**

Display the top three opportunities as sophisticated horizontal cards:

- Decision pill: `Pursue` / `Partner` / `Pass`
- Match score, e.g. `86% match`
- Tender title and buyer
- Sector and closing date
- One-line explanation, e.g. `Strong technical and geographic fit; add one comparable project reference.`
- `View analysis →` link

**Right: Readiness snapshot**

- Circular or horizontal overall readiness visual: `78 / 100 Bid readiness`
- Four concise rows with evidence-state icons:
  - Capabilities — Strong
  - Past performance — Needs one reference
  - Certifications — Complete
  - Insurance — Verify expiry
- `View company profile` link

#### Bottom panel

`Why this recommendation?` with a short note: `BidNorth ranks opportunities by mandatory eligibility, service fit, relevant project evidence, geography, and readiness. It does not predict award outcomes.`

---

### Page B — Opportunities (`/opportunities`)

#### Goal

Give the user a credible, useful browsing experience without pretending to have a live government-data integration.

#### Header

Title: `Opportunities`

Subhead: `Curated federal and Ontario public opportunities matched to Northern Grid Solutions.`

On the right, have an outlined `How matching works` button that opens a modal/popover explaining the model.

#### Controls

- Search field: `Search opportunities`
- Filter chips/dropdowns: Source, Sector, Location, Decision
- Sort control: `Best match` / `Closing soon` / `Newest`
- Small source note: `Sample data sourced from public tender notices. Always verify details in the original notice.`

#### Results table

Do not use a generic spreadsheet-style table. Use list rows with structured columns:

- Match score / decision status
- Tender title and tender number
- Buyer and source
- Tags: sector, location
- Closing date
- Chevron

Clicking a row opens `/opportunities/[id]`.

Include all 12 sample tenders, but make the first three especially polished and relevant.

---

### Page C — Tender analysis (`/opportunities/[id]`)

#### Goal

This is the main demo page. It must look exceptional and make the product’s value instantly obvious.

#### Header

Breadcrumb: `Opportunities / Energy Efficiency Retrofit Services`

Decision badge: `Pursue`

Headline: `Energy Efficiency Retrofit Services`

Metadata: `Natural Resources Canada · Federal · Ontario · Closes Oct 15, 2026`

Right actions:

- primary: `Generate bid plan`
- secondary: `View original tender ↗`

The external link should open the configured source URL in a new tab.

#### Hero analysis card

Large 8/4 split card.

**Left:**

- `86%` large match score
- label: `Strong fit for Northern Grid Solutions`
- sentence: `Your clean-energy expertise, Ontario coverage, and municipal utility experience closely match this opportunity.`
- Four segmented metric bars:
  - Service fit — 94%
  - Eligibility — 100%
  - Project evidence — 68%
  - Operational fit — 86%

**Right:**

`Recommended decision` card:

- Big status: `Pursue`
- `Why now`: `You meet all mandatory requirements and can strengthen your evaluation score with one additional comparable-project reference.`
- `11 days remaining`
- CTA: `Start bid plan`

#### Content below hero: two-column layout

**Left (about 8 columns):**

1. **Mandatory requirements**
   - Requirement text
   - State icon/pill: `Verified`, `Needs evidence`, `Not met`
   - Source reference e.g. `Tender §3.2`
   - Use five requirements, with at least one `Needs evidence` for the top tender.

2. **Evaluation priorities**
   - Three rows: Technical approach 45%, Relevant experience 35%, Value and pricing 20%
   - Give a one-sentence suggestion under each.

3. **Why this is a fit**
   - Three grounded bullets that map company information to tender requirements.

**Right (about 4 columns):**

1. **Next actions**
   - Checklist with due-date offsets:
     - `Today — Confirm insurance expiry`
     - `Within 2 days — Add Waterloo utility project reference`
     - `Within 5 days — Draft technical approach`
     - `Before Oct 13 — Internal compliance review`
   - Progress indicator such as `1 of 4 complete`.

2. **AI Bid Coach**
   - Premium compact panel with a sparkle icon, not a chatbot bubble.
   - Initial coach output should be visible without a click.
   - button: `Refresh analysis`
   - Loading state uses a refined shimmer/skeleton.
   - Include a small citation / disclaimer: `Recommendations are based on your profile and the tender information shown. Verify all requirements in the source notice.`

3. **Tender source**
   - Source name, external link, date accessed, and “public notice” indicator.

#### Bid-plan interaction

The `Generate bid plan` button opens a right-side drawer or modal—not a new page. It contains:

- Title: `Bid plan for Energy Efficiency Retrofit Services`
- Four phases: qualify, prepare evidence, write response, review & submit
- Relevant short tasks in each phase
- A simple export-looking `Copy plan` button that actually copies formatted text to clipboard and changes to `Copied`.

---

### Page D — Company profile (`/profile`)

#### Goal

Show the inputs powering the recommendation, and make the score feel credible.

#### Header

Title: `Company profile`

Subhead: `Keep your profile current to receive more accurate opportunities and bid-readiness guidance.`

Save button: `Save changes`.

#### Profile form

Use sections, not one enormous form:

1. `Company basics`
   - Name: Northern Grid Solutions
   - Headquarters: Kitchener-Waterloo, Ontario
   - Team size: 18
   - Region served: Ontario, Québec, Atlantic Canada

2. `Services and capabilities`
   - editable tag inputs: Energy-management software, Building retrofits, Utility analytics, Project management

3. `Qualifications`
   - Certification tags: SOC 2 Type II, Professional liability insurance, Ontario business registration

4. `Relevant project evidence`
   - three compact project cards: title, client type, value range, outcome, year
   - Make the Waterloo utility project card visibly marked `Recommended for next tender`.

5. `Readiness checks`
   - Insurance expiration: Dec 2026
   - Procurement contact: Maya Chen
   - Last reviewed: today

Form edits should update client state, and match scores should plausibly change when capability tags or region change. Use localStorage persistence if straightforward; it must not be fragile.

---

### Optional Page E — Proposal review

Only build this after Pages A–D are complete.

Embed a small panel on the tender-detail page:

- Label: `Proposal readiness check`
- A textarea populated with a short sample technical approach.
- button: `Review against tender criteria`
- Result categories: Coverage, Evidence, Compliance risks.
- Show three specific, source-tied suggestions.

No actual file-upload storage is necessary. Do not claim legal review or guaranteed compliance.

---

## 6. Data model and sample content

### TypeScript interfaces

```ts
export type Decision = "pursue" | "partner" | "pass";
export type RequirementStatus = "verified" | "needs_evidence" | "not_met";

export interface CompanyProject {
  id: string;
  title: string;
  clientType: string;
  year: number;
  valueRange: string;
  outcome: string;
  tags: string[];
}

export interface CompanyProfile {
  name: string;
  headquarters: string;
  employeeCount: number;
  regions: string[];
  capabilities: string[];
  certifications: string[];
  projects: CompanyProject[];
  insuranceExpiry: string;
  procurementContact: string;
}

export interface TenderRequirement {
  id: string;
  text: string;
  mandatory: boolean;
  sourceReference: string;
  requiredCapabilities?: string[];
  requiredCertifications?: string[];
}

export interface Tender {
  id: string;
  tenderNumber: string;
  title: string;
  buyer: string;
  source: "CanadaBuys" | "Ontario Tenders";
  sourceUrl: string;
  publishedDate: string;
  closingDate: string;
  sector: string;
  location: string;
  description: string;
  requirements: TenderRequirement[];
  evaluationCriteria: { name: string; weight: number; suggestion: string }[];
  requiredRegions: string[];
  keywords: string[];
  aiFallbackInsight: string;
}

export interface MatchResult {
  tenderId: string;
  score: number;
  decision: Decision;
  serviceFit: number;
  eligibility: number;
  projectEvidence: number;
  operationalFit: number;
  summary: string;
  requirementStatuses: Record<string, RequirementStatus>;
  nextActions: { title: string; timing: string; complete: boolean }[];
}
```

### Demo company

Use the following default profile:

```ts
{
  name: "Northern Grid Solutions",
  headquarters: "Kitchener-Waterloo, Ontario",
  employeeCount: 18,
  regions: ["Ontario", "Québec", "Atlantic Canada"],
  capabilities: [
    "Energy-management software",
    "Building retrofits",
    "Utility analytics",
    "Project management"
  ],
  certifications: [
    "SOC 2 Type II",
    "Professional liability insurance",
    "Ontario business registration"
  ],
  projects: [
    {
      id: "project-waterloo",
      title: "Municipal energy analytics rollout",
      clientType: "Waterloo Region utility",
      year: 2025,
      valueRange: "$500K–$1M",
      outcome: "Reduced peak-energy consumption reporting time by 43%.",
      tags: ["utility", "analytics", "Ontario", "energy"]
    },
    {
      id: "project-retrofit",
      title: "Portfolio retrofit assessment",
      clientType: "Ontario commercial real-estate portfolio",
      year: 2024,
      valueRange: "$250K–$500K",
      outcome: "Identified a 21% projected reduction in energy intensity.",
      tags: ["retrofit", "Ontario", "energy"]
    },
    {
      id: "project-analytics",
      title: "Energy reporting platform implementation",
      clientType: "Regional public agency",
      year: 2023,
      valueRange: "$100K–$250K",
      outcome: "Unified reporting across 34 facilities.",
      tags: ["software", "public sector", "analytics"]
    }
  ],
  insuranceExpiry: "December 2026",
  procurementContact: "Maya Chen"
}
```

### Sample tender set

Create 12 believable opportunities. The exact source URLs can be the official portal URLs or documented sample links; do not fabricate a claim that records are live. Label the collection as `Demo tender dataset` in the app.

Required opportunities:

1. **Energy Efficiency Retrofit Services** — Natural Resources Canada — CanadaBuys — Ontario — closing Oct 15, 2026 — target score 86 / Pursue.
2. **Municipal Building Energy Management Platform** — Ontario Infrastructure and Lands Corporation — Ontario Tenders — Ontario — target score 79 / Pursue.
3. **Climate Data Modernization Advisory Services** — Environment and Climate Change Canada — CanadaBuys — hybrid/remote — target score 68 / Partner.
4. **EV Fleet Charging Infrastructure** — City/municipal opportunity — Ontario Tenders — target score 62 / Partner.
5. **Cybersecurity Managed Services** — provincial opportunity — target score 37 / Pass; lack of core cybersecurity capability.
6. **Road Reconstruction General Contractor** — federal/provincial opportunity — target score 22 / Pass.
7. **Energy Modelling and Verification Services** — Ontario Tenders — target score 74 / Pursue.
8. **Public Sector Data Dashboard** — CanadaBuys — target score 71 / Pursue.
9. **Solar Feasibility Study** — Ontario Tenders — target score 66 / Partner.
10. **Fleet Telematics Hardware Supply** — CanadaBuys — target score 41 / Pass.
11. **Building Automation Assessment** — Ontario Tenders — target score 83 / Pursue.
12. **Sustainability Reporting Services** — CanadaBuys — target score 73 / Pursue.

For the top tender, use these requirements:

- Ontario business registration — mandatory — verified — `Tender §3.2`
- Professional liability insurance of at least $2M — mandatory — verified — `Tender §3.4`
- Two comparable energy-retrofit or energy-management projects — mandatory — needs evidence — `Tender §4.1`
- Ontario implementation coverage — mandatory — verified — `Tender §3.3`
- Carbon-reduction measurement methodology — rated requirement — verified — `Tender §5.2`

Use evaluation criteria:

- Technical approach — 45% — `Connect the proposed energy-management workflow to the buyer’s facility portfolio and reporting needs.`
- Relevant experience — 35% — `Lead with the Waterloo utility project and quantify the outcome.`
- Value and pricing — 20% — `Show phased delivery and transparent milestone pricing.`

---

## 7. Matching engine rules

### Requirements

Build `calculateMatch(company, tender): MatchResult` as a standalone pure TypeScript function. The app must use this function to recompute results when the profile changes.

### Scoring

- Service fit: 35% of overall score. Compare tender keywords/required capabilities with profile capabilities and project tags.
- Eligibility: 30%. Mandatory certification and region requirements dominate. A missing hard requirement must materially reduce the result.
- Project evidence: 20%. Look for related project tags and relevant client types.
- Operational fit: 15%. Compare geography and employee count/fit indicators.

### Decision rules

- `Pass`: any clearly unmet mandatory requirement or score below 45.
- `Partner`: score 45–69, or a strategic tender with an evidence/qualification gap that can plausibly be addressed by a partner.
- `Pursue`: score 70+ and no unmet mandatory requirement.

### Explanation rules

Never render a score without explanation. Every match needs:

- a plain-language summary;
- at least two concrete reasons for the decision;
- a requirements table with statuses;
- next actions connected to an actual gap or deadline.

### Methodology copy

Use this exact conceptual disclaimer wherever appropriate:

> BidNorth assesses fit and bid readiness using the information in your profile and the tender record. It does not predict award outcomes or replace review of the original procurement documents.

---

## 8. AI Bid Coach implementation

### API route

Create `src/app/api/bid-coach/route.ts`.

Input body:

```ts
{
  company: CompanyProfile,
  tender: Tender,
  match: MatchResult
}
```

### Server behavior

1. If `OPENAI_API_KEY` is configured, call OpenAI’s Responses API with `gpt-6-astra` and a focused prompt.
2. Instruct the model to return valid JSON with:

```ts
{
  "headline": "string, max 12 words",
  "assessment": "string, 2–3 concise sentences",
  "priorityActions": ["string", "string", "string"],
  "watchouts": ["string", "string"]
}
```

3. Validate the result. If the response is invalid, the API request fails, or no key exists, return a deterministic fallback derived from `tender.aiFallbackInsight` and the match result.
4. Never expose the key to the browser.
5. Set a short timeout and show a user-friendly result; no raw stack traces.

### AI system prompt

```text
You are BidNorth’s procurement-readiness coach for Canadian small businesses.
Your job is to explain a tender fit assessment clearly, cautiously, and concretely.

Do not predict whether the company will win. Do not claim legal certainty. Do not invent tender requirements, certifications, sources, project experience, deadlines, or scores.
Use only the structured company profile, tender record, and match assessment provided.
Prioritize unmet mandatory requirements and missing evidence. Recommendations must be actionable and concise.
Return only valid JSON matching the requested schema.
```

### Suggested user prompt assembly

Pass the serialized company, tender, and match objects. Explicitly say that source references in the tender are the facts of record and must be preserved when named.

### Fallback example for top tender

Headline: `Strengthen the evidence, then pursue`

Assessment: `Northern Grid Solutions meets the mandatory registration, insurance, and Ontario coverage requirements. Your strongest gap is proving two comparable projects; lead with the Waterloo utility rollout and add a second outcome-focused reference before drafting.`

Priority actions:

- `Document two comparable projects with scope, value, outcome, and client reference.`
- `Confirm professional-liability coverage remains valid through project completion.`
- `Draft a technical approach that maps your analytics workflow to facility-level carbon reporting.`

Watchouts:

- `Verify the complete solicitation package before relying on this summary.`
- `Do not submit until mandatory evidence has been reviewed internally.`

---

## 9. File structure

Use an organized but simple structure:

```text
src/
  app/
    api/bid-coach/route.ts
    opportunities/[id]/page.tsx
    opportunities/page.tsx
    profile/page.tsx
    layout.tsx
    page.tsx
    globals.css
  components/
    app-shell.tsx
    sidebar.tsx
    page-header.tsx
    opportunity-card.tsx
    opportunity-list.tsx
    match-score.tsx
    decision-badge.tsx
    metric-bar.tsx
    requirements-list.tsx
    bid-coach.tsx
    bid-plan-drawer.tsx
    readiness-snapshot.tsx
    profile-form.tsx
    empty-state.tsx
  data/
    company.ts
    tenders.ts
  lib/
    matching.ts
    utils.ts
    bid-coach-fallback.ts
  types/
    procurement.ts
public/
  (only use assets if genuinely necessary)
README.md
.env.example
```

Use client components only where state or browser interactions are required. Keep pure matching and data logic out of page files.

---

## 10. Quality bar and UX states

### Required states

- Dashboard loads with no visible layout shift.
- Opportunity list has an empty search state: `No opportunities match those filters.`
- Bid Coach has initial, loading, success, and fallback/error-safe states.
- Save button provides a subtle `Saved` confirmation.
- Copy plan button changes to `Copied` after using the clipboard.
- External tender links use `target="_blank"` and appropriate rel attributes.
- All score colours also have written labels; do not rely on colour alone.
- Keyboard focus states are visible.

### Visual anti-patterns to avoid

- No huge gradient blobs.
- No stock photography.
- No animated particle field.
- No fake notification spam.
- No excessive rounded “pill” UI.
- No gradients on every card.
- No oversized icons.
- No random charts.
- No “AI magic” language or ambiguous claims.

### Copy quality

Use concise, calm, confident copy. The app should sound like a trusted procurement analyst, not a startup hype machine.

---

## 11. README requirements

The README must include:

1. A polished product summary and screenshot placeholder.
2. Problem and Canadian-growth impact.
3. Main features.
4. Technology choices.
5. Local setup instructions.
6. Environment variable instructions.
7. How matching works, including weights and decision rules.
8. Data/source note: demo dataset is curated from public tender notices; users must verify official source documents.
9. Ethical/limitations note: does not predict awards, submit bids, or replace professional/legal review.

---

## 12. Acceptance checklist

Before declaring the build complete, verify all of the following:

- [ ] `npm run build` completes successfully.
- [ ] Desktop layout looks polished at 1440px wide.
- [ ] Core layout remains usable at 768px and 390px wide.
- [ ] The default dashboard shows 3 strong opportunities and a readiness snapshot.
- [ ] Opportunity filters and search visibly work.
- [ ] Opening the top tender shows an 86% `Pursue` analysis with source-backed requirement statuses.
- [ ] Profile edits update at least some match results.
- [ ] Bid-plan drawer opens, has useful phases/tasks, and copy works.
- [ ] Bid Coach works with an API key and has an excellent fallback without one.
- [ ] No secret/API key appears in client code, git files, or UI.
- [ ] README is clear enough for judges to run the project.
- [ ] No features outside the scope were added at the expense of finish quality.

---

## 13. Final build instruction to the coding agent

Build the complete BidNorth application described above. Work autonomously, make reasonable implementation decisions, and prioritize a deeply polished, coherent core experience over extra features. Use clean, production-quality TypeScript. Test the app, resolve type/build errors, and do not leave placeholder UI in the primary demo flow.

The demo must be visually impressive but restrained: a trustworthy B2B procurement product inspired by the clarity and quality of modern industry-leading software, never a generic AI dashboard. The primary journey is:

**Overview → top opportunity → explainable Pursue/Partner/Pass analysis → bid plan → optional AI coach refresh.**

Everything in the experience should support that journey.
