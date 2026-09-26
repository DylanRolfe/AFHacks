import type {
  CompanyProfile,
  MatchResult,
  Tender,
  RequirementStatus,
} from "@/types/procurement";
import { normalize } from "./utils";
import { createBidPlan } from "./bid-plan";

export const MATCH_WEIGHTS = {
  serviceFit: 0.35,
  eligibility: 0.3,
  projectEvidence: 0.2,
  operationalFit: 0.15,
} as const;
const has = (values: string[], value: string) =>
  values.some((v) => normalize(v) === normalize(value));
const ratio = (found: number, total: number) =>
  total ? Math.min(found / total, 1) : 1;

export function relatedProjects(company: CompanyProfile, tender: Tender) {
  return company.projects.filter(
    (p) =>
      p.tags.some((tag) => has(tender.projectTags, tag)) ||
      tender.projectTags.some((tag) =>
        normalize(p.clientType).includes(normalize(tag)),
      ),
  );
}

/** Pure, deterministic; no stored scores or tender-specific overrides. */
export function calculateMatch(
  company: CompanyProfile,
  tender: Tender,
): MatchResult {
  const relevant = relatedProjects(company, tender);
  const covered =
    !tender.requiredRegions.length ||
    tender.requiredRegions.every((r) => has(company.regions, r));
  const matchedCapabilities = tender.serviceCapabilities.filter((c) =>
    has(company.capabilities, c),
  );
  const corpus = normalize(
    [...company.capabilities, ...company.projects.flatMap((p) => p.tags)].join(
      " ",
    ),
  );
  const keywords = tender.keywords.filter((k) => corpus.includes(normalize(k)));
  const serviceFit = Math.round(
    75 * ratio(matchedCapabilities.length, tender.serviceCapabilities.length) +
      25 * ratio(keywords.length, tender.keywords.length),
  );
  const requirementStatuses: Record<string, RequirementStatus> = {};
  for (const req of tender.requirements) {
    let status: RequirementStatus = "human_review";
    if (
      req.requiredCertifications?.length ||
      req.requiredCapabilities?.length ||
      req.kind
    )
      status = "verified";
    if (
      req.requiredCertifications?.some(
        (c) => !has(company.certifications, c),
      ) ||
      req.requiredCapabilities?.some((c) => !has(company.capabilities, c))
    )
      status = req.mandatory ? "hard_blocker" : "missing_evidence";
    if (req.kind === "region" && !covered)
      status = req.mandatory ? "hard_blocker" : "missing_evidence";
    if (req.kind === "insurance" && status !== "hard_blocker") {
      if (
        !company.insuranceExpiry ||
        company.insuranceCoverageMillions === undefined
      )
        status = "missing_evidence";
      else if (
        company.insuranceExpiry < tender.closingDate ||
        company.insuranceCoverageMillions < (req.minimumInsuranceMillions ?? 0)
      )
        status = req.mandatory ? "hard_blocker" : "missing_evidence";
    }
    if (req.kind === "projects" && status !== "hard_blocker") {
      const required = req.minimumProjects ?? tender.comparableProjects;
      status =
        relevant.length < required
          ? "missing_evidence"
          : relevant.filter((p) => p.referenceReady).length < required
            ? "missing_evidence"
            : "verified";
    }
    if (req.kind === "security" && status !== "hard_blocker")
      status = "human_review";
    requirementStatuses[req.id] = status;
  }
  const mandatory = tender.requirements.filter((r) => r.mandatory);
  const blockers = mandatory.filter(
    (r) => requirementStatuses[r.id] === "hard_blocker",
  );
  const eligibility = Math.round(
    mandatory.length
      ? mandatory.reduce(
          (sum, r) =>
            sum +
            {
              verified: 100,
              missing_evidence: 50,
              hard_blocker: 0,
              human_review: 0,
            }[requirementStatuses[r.id]],
          0,
        ) / mandatory.length
      : 100,
  );
  // A project description earns 62% evidence credit. A prepared client reference earns 100%.
  const evidenceCredits = relevant
    .map((p) => (p.referenceReady ? 1 : 0.62))
    .sort((a, b) => b - a)
    .slice(0, tender.comparableProjects)
    .reduce((sum, credit) => sum + credit, 0);
  const projectEvidence = Math.round(
    100 * Math.min(evidenceCredits / Math.max(tender.comparableProjects, 1), 1),
  );
  const operationalFit = Math.round(
    (covered ? 65 : 0) +
      25 * ratio(company.employeeCount, tender.idealTeamSize) +
      (company.procurementContact.trim() ? 10 : 0),
  );
  const score = Math.round(
    serviceFit * 0.35 +
      eligibility * 0.3 +
      projectEvidence * 0.2 +
      operationalFit * 0.15,
  );
  const mandatoryNeedsVerification = mandatory.filter((r) =>
    ["missing_evidence", "human_review"].includes(requirementStatuses[r.id]),
  );
  // Readiness is deliberately gated by mandatory evidence. A high fit score
  // cannot turn an unverified mandatory item into a green light.
  const decision: MatchResult["decision"] = blockers.length
    ? "blocker"
    : mandatoryNeedsVerification.length
      ? "review"
      : "ready";
  const summary = blockers.length
    ? `Hard stop: ${blockers[0].text}. Resolve this mandatory requirement before assigning proposal-writing time.`
    : mandatoryNeedsVerification.length
      ? `${mandatoryNeedsVerification.length === 2 ? "Two" : mandatoryNeedsVerification.length} mandatory item${mandatoryNeedsVerification.length === 1 ? " is" : "s are"} not yet verified. Resolve these gaps before assigning proposal-writing time.`
      : "All mandatory items are verified against the declared profile. Confirm the complete official tender package before preparing a bid.";
  const reasons = [
    matchedCapabilities.length
      ? `${matchedCapabilities.join(", ")} align with ${matchedCapabilities.length} of ${tender.serviceCapabilities.length} service areas.`
      : "Your profile does not yet cover this tender’s core service areas.",
    `${relevant.length} related project${relevant.length === 1 ? "" : "s"} in your profile; ${relevant.filter((p) => p.referenceReady).length} with a prepared client reference.`,
    covered
      ? tender.requiredRegions.length
        ? `Your declared ${tender.requiredRegions.join(" and ")} coverage matches the delivery region.`
        : "The hybrid / remote delivery model fits your declared service coverage."
      : `Your profile does not include coverage in ${tender.requiredRegions.join(", ")}.`,
  ];
  const result: MatchResult = {
    tenderId: tender.id,
    score,
    decision,
    serviceFit,
    eligibility,
    projectEvidence,
    operationalFit,
    summary,
    reasons,
    requirementStatuses,
    nextActions: [],
  };
  result.nextActions = createBidPlan(company, tender, result).map(
    (phase, i) => ({
      id: `${i}-0`,
      timing: phase.timing,
      title: phase.tasks[0],
      owner: phase.owner,
      complete: false,
    }),
  );
  return result;
}

export function profileReadiness(company: CompanyProfile) {
  const capabilities = Math.min(company.capabilities.length / 4, 1) * 30;
  const projects =
    Math.min(
      company.projects.reduce((s, p) => s + (p.referenceReady ? 1 : 0.45), 0) /
        3,
      1,
    ) * 40;
  const certifications = Math.min(company.certifications.length / 3, 1) * 20;
  const insurance =
    company.insuranceExpiry && company.insuranceCoverageMillions ? 10 : 0;
  return Math.round(capabilities + projects + certifications + insurance);
}
