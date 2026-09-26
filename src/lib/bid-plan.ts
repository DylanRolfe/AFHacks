import type { CompanyProfile, MatchResult, Tender } from "@/types/procurement";
import { dateLabel, reviewDate } from "./utils";
export function createBidPlan(
  company: CompanyProfile,
  tender: Tender,
  match: MatchResult,
) {
  const gaps = tender.requirements.filter(
    (r) => match.requirementStatuses[r.id] !== "verified",
  );
  return [
    {
      title: "Qualify",
      timing: "Today",
      tasks: [
        match.decision === "pass"
          ? "Pause response work until all mandatory blockers are resolved."
          : `Confirm the ${match.decision} decision with ${company.procurementContact || "your procurement lead"}.`,
        "Read the full official notice and amendments; verify all demo details.",
        ...gaps
          .filter((r) => match.requirementStatuses[r.id] === "not_met")
          .map((r) => `Resolve ${r.text} (${r.sourceReference}).`),
      ],
    },
    {
      title: "Prepare evidence",
      timing: "Within 2 days",
      tasks: [
        ...(gaps.length
          ? gaps.map(
              (r) => `Prepare evidence for ${r.text} (${r.sourceReference}).`,
            )
          : [
              "Collect the verified qualification documents and project references.",
            ]),
        "Check insurance limits and validity for the required contract period.",
      ],
    },
    {
      title: "Write response",
      timing: "Within 5 days",
      tasks: tender.evaluationCriteria.map(
        (c) => `${c.name} (${c.weight}%): ${c.suggestion}`,
      ),
    },
    {
      title: "Review & submit",
      timing: `Before ${dateLabel(reviewDate(tender.closingDate))}`,
      tasks: [
        "Cross-check every mandatory item against the official solicitation.",
        "Have a colleague review pricing, references, and sign-off requirements.",
        `Confirm the official closing time and time zone for ${dateLabel(tender.closingDate, true)}. Submit manually through the required portal.`,
      ],
    },
  ];
}
export function formatBidPlan(
  company: CompanyProfile,
  tender: Tender,
  match: MatchResult,
) {
  return [
    `Bid plan for ${tender.title}`,
    `${company.name} · ${match.score}% match · ${match.decision.toUpperCase()}`,
    `Closes ${dateLabel(tender.closingDate, true)} · ${tender.tenderNumber}`,
    "DEMO DATA — verify all details against the official notice.",
    "",
    ...createBidPlan(company, tender, match).flatMap((p, i) => [
      `${i + 1}. ${p.title} — ${p.timing}`,
      ...p.tasks.map((t) => `- ${t}`),
      "",
    ]),
    `Official portal: ${tender.sourceUrl}`,
    "BidNorth does not submit bids or predict award outcomes.",
  ].join("\n");
}
