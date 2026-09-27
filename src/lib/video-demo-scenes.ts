export type DemoAction =
  | "open-projects"
  | "open-security"
  | "open-plan"
  | "close-plan";

export type DemoScene = {
  start: number;
  label: string;
  route: string;
  target?: string;
  scroll?: "none" | "top" | "center";
  scrollDuration?: number;
  action?: DemoAction;
};

export const DEMO_DURATION = 270;
export const DEMO_TENDER_ROUTE = "/opportunities/energy-retrofit?sample=1&demo=video";

// Times are seconds from Start. Keep every navigation and visual cue here.
export const videoDemoScenes: DemoScene[] = [
  // 0:00–0:05 · Introductions. Hold on the untouched hero.
  { start: 0, label: "Introductions", route: "/demo", scroll: "none" },
  // 0:05–0:26 · The problem, held on the hero and its sample ledger.
  { start: 5, label: "The BidNorth promise", route: "/demo", target: "hero-headline", scroll: "none" },
  { start: 12, label: "A promising tender can hide mandatory gaps", route: "/demo", target: "hero-ledger", scroll: "none" },
  { start: 20, label: "Insurance, security, and project proof", route: "/demo", target: "hero-requirement-projects", scroll: "none" },
  // 0:26–1:03 · Canadian context and the two cited figures.
  { start: 26, label: "The Canadian opportunity", route: "/demo", target: "canada", scroll: "center", scrollDuration: 7 },
  { start: 38, label: "$66.9B in federal contracts", route: "/demo", target: "canada-contracts", scroll: "none" },
  { start: 51, label: "SMEs employ 63.6% of private-sector workers", route: "/demo", target: "canada-smes", scroll: "none" },
  // 1:03–1:30 · The insight, product preview, and sample CTA.
  { start: 63, label: "Finding a tender is only the beginning", route: "/demo", target: "discovery-title", scroll: "center", scrollDuration: 4 },
  { start: 73, label: "A readiness check after discovery", route: "/demo", target: "discovery-comparison", scroll: "center" },
  { start: 81, label: "Company evidence against requirements", route: "/demo", target: "product-window", scroll: "center", scrollDuration: 4 },
  { start: 87, label: "Open the sample readiness check", route: "/demo", target: "product-cta", scroll: "center" },
  // 1:30–2:00 · Fictional tender and the decision above the score.
  { start: 90, label: "Opening the fictional sample tender", route: DEMO_TENDER_ROUTE, scroll: "top" },
  { start: 98, label: "Fix gaps before committing resources", route: DEMO_TENDER_ROUTE, target: "decision", scroll: "none" },
  // 2:00–2:30 · Project evidence in the ledger.
  { start: 120, label: "The Bid Readiness Ledger", route: DEMO_TENDER_ROUTE, target: "ledger", scroll: "top" },
  { start: 125, label: "Two comparable projects · Missing evidence", route: DEMO_TENDER_ROUTE, target: "requirement-projects", scroll: "center" },
  { start: 131, label: "Inspect the missing project evidence", route: DEMO_TENDER_ROUTE, target: "requirement-projects", scroll: "center", action: "open-projects" },
  { start: 140, label: "Sample requirement reference", route: DEMO_TENDER_ROUTE, target: "source-projects", scroll: "center" },
  { start: 146, label: "Add a second qualifying reference", route: DEMO_TENDER_ROUTE, target: "action-projects", scroll: "center" },
  // 2:30–2:53 · Human review and official-source caveat.
  { start: 150, label: "Security · Needs human review", route: DEMO_TENDER_ROUTE, target: "requirement-security", scroll: "center", action: "open-security" },
  { start: 159, label: "BidNorth does not guess", route: DEMO_TENDER_ROUTE, target: "status-security", scroll: "center" },
  { start: 166, label: "The original tender remains authoritative", route: DEMO_TENDER_ROUTE, target: "authority-security", scroll: "center" },
  // 2:53–3:20 · Reveal the plan phases one at a time.
  { start: 173, label: "Create a readiness plan", route: DEMO_TENDER_ROUTE, target: "plan-blocked", scroll: "none", action: "open-plan" },
  { start: 176, label: "1 · Confirm the security requirement", route: DEMO_TENDER_ROUTE, target: "plan-phase-0", scroll: "center" },
  { start: 180, label: "2 · Check insurance evidence", route: DEMO_TENDER_ROUTE, target: "plan-phase-1", scroll: "center" },
  { start: 184, label: "3 · Add the second comparable project", route: DEMO_TENDER_ROUTE, target: "plan-phase-2", scroll: "center" },
  { start: 188, label: "4 · Complete an internal review", route: DEMO_TENDER_ROUTE, target: "plan-phase-3", scroll: "center" },
  { start: 193, label: "5 · Draft only after verification", route: DEMO_TENDER_ROUTE, target: "plan-phase-4", scroll: "center" },
  // 3:20–3:40 · Local, bounded Coach guidance.
  { start: 200, label: "Profile-based Readiness Coach", route: DEMO_TENDER_ROUTE, target: "coach", scroll: "center", action: "close-plan" },
  { start: 207, label: "Practical next steps", route: DEMO_TENDER_ROUTE, target: "coach-actions", scroll: "center" },
  { start: 214, label: "Guidance has clear limits", route: DEMO_TENDER_ROUTE, target: "coach-limits", scroll: "center" },
  // 3:40–4:26 · Planned validation, trusted-group pilots, and the mission statement.
  { start: 220, label: "What happens after the hackathon", route: "/about?demo=video", target: "roadmap", scroll: "top", scrollDuration: 7 },
  { start: 232, label: "Validate with ten Canadian businesses", route: "/about?demo=video", target: "roadmap-validation", scroll: "center", scrollDuration: 3 },
  { start: 245, label: "Pilot through trusted business groups", route: "/about?demo=video", target: "roadmap-pilots", scroll: "center", scrollDuration: 3 },
  { start: 255, label: "Make public contracts more accessible", route: "/about?demo=video", target: "roadmap-statement", scroll: "center", scrollDuration: 4 },
  // 4:26–4:30 · Closing line.
  { start: 266, label: "Bid smarter. Start stronger.", route: "/about?demo=video", scroll: "none" },
];
