import type { Decision, RequirementStatus } from "@/types/procurement";
export const outcomeLabels: Record<Decision, string> = {
  ready: "Ready to prepare a bid",
  review: "Fix gaps before committing proposal resources",
  blocker: "Do not commit proposal resources yet",
};
export const statusLabels: Record<RequirementStatus, string> = {
  verified: "Verified",
  missing_evidence: "Missing evidence",
  human_review: "Needs human review",
  hard_blocker: "Hard stop",
};
