import type {
  CompanyProfile,
  MatchResult,
  Tender,
  RequirementStatus,
} from "@/types/procurement";
import { dateLabel, normalize, reviewDate } from "./utils";

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
    let status: RequirementStatus = "verified";
    if (
      req.requiredCertifications?.some(
        (c) => !has(company.certifications, c),
      ) ||
      req.requiredCapabilities?.some((c) => !has(company.capabilities, c))
    )
      status = "not_met";
    if (req.kind === "region" && !covered) status = "not_met";
    if (req.kind === "insurance" && status !== "not_met") {
      if (
        !company.insuranceExpiry ||
        company.insuranceCoverageMillions === undefined
      )
        status = "needs_evidence";
      else if (
        company.insuranceExpiry < tender.closingDate ||
        company.insuranceCoverageMillions < (req.minimumInsuranceMillions ?? 0)
      )
        status = "not_met";
    }
    if (req.kind === "projects") {
      const required = req.minimumProjects ?? tender.comparableProjects;
      status =
        relevant.length < required
          ? "needs_evidence"
          : relevant.filter((p) => p.referenceReady).length < required
            ? "needs_evidence"
            : "verified";
    }
    requirementStatuses[req.id] = status;
  }
  const mandatory = tender.requirements.filter((r) => r.mandatory);
  const blockers = mandatory.filter(
    (r) => requirementStatuses[r.id] === "not_met",
  );
  const gaps = tender.requirements.filter(
    (r) => requirementStatuses[r.id] === "needs_evidence",
  );
  const eligibility = Math.round(
    mandatory.length
      ? mandatory.reduce(
          (sum, r) =>
            sum +
            { verified: 100, needs_evidence: 70, not_met: 0 }[
              requirementStatuses[r.id]
            ],
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
    100 * Math.min(evidenceCredits / tender.comparableProjects, 1),
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
  const decision =
    blockers.length || score < 45
      ? "pass"
      : score < 70 || (tender.strategicGap && serviceFit < 80)
        ? "partner"
        : "pursue";
  const summary = blockers.length
    ? `Mandatory gap: ${blockers[0].text.toLowerCase()}. Resolve this before investing in a response.`
    : decision === "pursue"
      ? `Strong service and geographic fit${gaps.length ? "; prepare comparable-project references before drafting." : "; your supporting evidence is ready for review."}`
      : decision === "partner"
        ? (tender.strategicGap ??
          "Relevant experience provides a starting point; a specialist partner could address the remaining service gaps.")
        : "Limited overlap with your core capabilities and comparable project experience.";
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
  const nextActions: MatchResult["nextActions"] = [
    {
      id: "qualify",
      timing: "Today",
      title: blockers.length
        ? `Resolve: ${blockers[0].text}`
        : "Confirm insurance coverage and expiry against the full notice",
      complete: false,
    },
    {
      id: "evidence",
      timing: "Within 2 days",
      title: gaps.length
        ? `Prepare ${tender.comparableProjects} comparable-project references${relevant.some((p) => p.id === "project-waterloo") ? ", starting with the Waterloo utility project" : ""}`
        : "Assemble the verified qualifications and reference package",
      complete: false,
    },
    {
      id: "approach",
      timing: "Within 5 days",
      title:
        tender.strategicGap && decision !== "pursue"
          ? tender.strategicGap
          : `Draft the ${tender.evaluationCriteria[0].name.toLowerCase()} response`,
      complete: false,
    },
    {
      id: "review",
      timing: `Before ${dateLabel(reviewDate(tender.closingDate))}`,
      title: "Complete an internal compliance and pricing review",
      complete: false,
    },
  ];
  return {
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
    nextActions,
  };
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
