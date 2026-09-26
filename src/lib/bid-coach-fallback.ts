import type {
  CoachInsight,
  CompanyProfile,
  MatchResult,
  Tender,
} from "@/types/procurement";
export function getFallbackInsight(
  company: CompanyProfile,
  tender: Tender,
  match: MatchResult,
): CoachInsight {
  const blocked = tender.requirements.filter(
    (r) => r.mandatory && match.requirementStatuses[r.id] === "not_met",
  );
  return {
    headline:
      match.decision === "pass"
        ? "Resolve the blockers before committing"
        : match.decision === "partner"
          ? "Build the right partnership first"
          : "Strengthen the evidence, then pursue",
    assessment: `${company.name}: ${match.summary} ${blocked.length ? `Review ${blocked.map((r) => r.sourceReference).join(", ")} in the complete notice.` : tender.aiFallbackInsight}`,
    priorityActions: match.nextActions.slice(0, 3).map((a) => a.title),
    watchouts: [
      "Verify the complete solicitation package; the records and section references shown here are illustrative.",
      "Do not submit until mandatory evidence has been reviewed internally.",
    ],
  };
}
