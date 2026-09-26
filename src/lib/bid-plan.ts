import type { CompanyProfile, MatchResult, Tender } from "@/types/procurement";
import { outcomeLabels } from "./readiness";
export function createBidPlan(
  company: CompanyProfile,
  tender: Tender,
  match: MatchResult,
) {
  const owner = company.procurementContact || "Procurement lead";
  const risks = tender.requirements.filter(
    (r) => r.mandatory && match.requirementStatuses[r.id] !== "verified",
  );
  const security = risks.find((r) => r.kind === "security");
  return [
    {
      title: "Resolve mandatory risks",
      timing: "Today",
      owner,
      tasks: [
        ...risks
          .filter((r) => match.requirementStatuses[r.id] === "hard_blocker")
          .map(
            (r) =>
              `Resolve hard stop: ${r.text} (Sample requirement reference: ${r.sourceReference}).`,
          ),
        ...(security
          ? [
              `Confirm whether the security requirement applies (${security.sourceReference}; Sample requirement reference).`,
            ]
          : []),
        ...risks
          .filter(
            (r) =>
              r.kind !== "security" &&
              r.kind !== "projects" &&
              match.requirementStatuses[r.id] !== "hard_blocker",
          )
          .map(
            (r) =>
              `Resolve ${r.text} (Sample requirement reference: ${r.sourceReference}).`,
          ),
        "Review the complete official package and amendments; confirm submission instructions and the closing time.",
      ],
    },
    {
      title: "Verify insurance evidence",
      timing: "Within two days",
      owner: "Finance lead",
      tasks: [
        "Obtain or verify the insurance certificate, coverage limit, and validity for the contract period.",
      ],
    },
    {
      title: "Complete project evidence",
      timing: "Within three days",
      owner: "Delivery lead",
      tasks: [
        "Add or verify qualifying project references with scope, outcome, and contact.",
        ...risks
          .filter((r) => r.kind === "projects")
          .map(
            (r) =>
              `Prepare evidence for ${r.text} (Sample requirement reference: ${r.sourceReference}).`,
          ),
      ],
    },
    {
      title: "Internal compliance review",
      timing: `Before the deadline · ${tender.closingDate} (verify official time)`,
      owner,
      tasks: [
        "Cross-check every mandatory item against the complete official solicitation and amendments.",
      ],
    },
    {
      title: "Begin proposal-response drafting",
      timing: "Only after all mandatory items are verified",
      owner: "Proposal lead",
      tasks: [
        "Begin proposal-response drafting after the mandatory readiness gate and internal review are complete.",
      ],
    },
  ];
}
export function formatBidPlan(
  company: CompanyProfile,
  tender: Tender,
  match: MatchResult,
  completed: string[] = [],
) {
  return [
    `Readiness plan for ${tender.title}`,
    company.name,
    outcomeLabels[match.decision],
    `Closes ${tender.closingDate} — ${tender.tenderNumber}`,
    "DEMO DATA — verify all details against the official notice.",
    "Timing below is suggested internal planning, not tender-imposed deadlines.",
    "",
    ...createBidPlan(company, tender, match).flatMap((p, i) => [
      `${i + 1}. ${p.title} — ${p.timing} — Owner: ${p.owner}`,
      ...p.tasks.map(
        (t, j) => `[${completed.includes(`${i}-${j}`) ? "x" : " "}] ${t}`,
      ),
      "",
    ]),
    `Official portal: ${tender.sourceUrl}`,
    "Completing tasks does not verify requirements. Update the evidence and review the ledger.",
    "BidNorth does not submit bids or predict award outcomes.",
  ].join("\n");
}
