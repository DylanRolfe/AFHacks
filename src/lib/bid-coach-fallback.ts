import { createBidPlan } from "./bid-plan";
import { outcomeLabels } from "./readiness";
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
    (r) => r.mandatory && match.requirementStatuses[r.id] === "hard_blocker",
  );
  return {
    headline: outcomeLabels[match.decision],
    assessment: `${company.name}: ${match.summary} ${blocked.length ? `Check ${blocked.map((r) => `Sample requirement reference ${r.sourceReference}`).join(", ")} in the original tender.` : "Confirm the verified items against the original tender before beginning proposal work."}`,
    priorityActions: createBidPlan(company, tender, match)
      .slice(0, 3)
      .map((p) => p.tasks[0]),
    watchouts: [
      "This is a Demo tender record. Sample requirement references are not citations to a live solicitation.",
      "Do not begin proposal work until every mandatory item is verified in the original tender.",
    ],
  };
}
