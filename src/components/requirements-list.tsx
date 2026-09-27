import { statusLabels } from "@/lib/readiness";
import type { CompanyProfile, MatchResult, Tender } from "@/types/procurement";
import { relatedProjects } from "@/lib/matching";

export function RequirementsList({
  tender,
  match,
  company,
}: {
  tender: Tender;
  match: MatchResult;
  company: CompanyProfile;
}) {
  const mandatory = tender.requirements.filter((r) => r.mandatory);
  const verified = mandatory.filter(
    (r) => match.requirementStatuses[r.id] === "verified",
  ).length;
  const related = relatedProjects(company, tender);
  const evidenceFor = (r: Tender["requirements"][number]) => {
    if (r.kind === "security")
      return "No reviewed security schedule or clearance evidence is recorded.";
    if (r.kind === "insurance")
      return company.insuranceCoverageMillions && company.insuranceExpiry
        ? `${company.insuranceCoverageMillions}M professional liability coverage declared; expiry ${company.insuranceExpiry}.`
        : "Insurance certificate, limit, and expiry have not been recorded in the company profile.";
    if (r.kind === "region")
      return company.regions.length
        ? `Declared delivery coverage: ${company.regions.join(", ")}.`
        : "No delivery coverage is recorded in the company profile.";
    if (r.kind === "projects")
      return related.length
        ? `Relevant company evidence: ${related.map((p) => `${p.title}${p.referenceReady ? " (reference ready)" : " (reference not yet confirmed)"}`).join("; ")}.`
        : "No comparable projects are recorded in the company profile.";
    const certifications = r.requiredCertifications?.filter((c) =>
      company.certifications.some((v) => v.toLowerCase() === c.toLowerCase()),
    );
    const capabilities = r.requiredCapabilities?.filter((c) =>
      company.capabilities.some((v) => v.toLowerCase() === c.toLowerCase()),
    );
    const evidence = [...(certifications ?? []), ...(capabilities ?? [])];
    return evidence.length
      ? `Company profile evidence: ${evidence.join(", ")}.`
      : "No matching certification or capability is recorded in the company profile.";
  };
  return (
    <section className="panel ledger" id="readiness-ledger" data-demo="ledger">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">EVIDENCE BEFORE EFFORT</span>
          <h2>Bid Readiness Ledger</h2>
        </div>
        <span className="panel-meta">
          {verified} of {mandatory.length} mandatory items verified
        </span>
      </div>
      <p className="ledger-intro">
        Select a requirement to inspect the evidence and the next action.
        Verified means matched to the declared profile, not independently
        certified.
      </p>
      <div className="ledger-columns" aria-hidden="true">
        <span>Requirement</span>
        <span>Status</span>
        <span>Company evidence</span>
        <span>Source reference</span>
        <span>Next action</span>
      </div>
      {tender.requirements.map((r) => {
        const status = match.requirementStatuses[r.id];
        const action =
          r.kind === "security"
            ? "Confirm applicability of the security schedule with the procurement lead."
            : r.kind === "projects"
              ? status === "verified"
                ? "Confirm qualifying references, scope, outcomes, and contacts against the official requirement."
                : "Add a second qualifying reference with scope, outcome, and contact."
              : r.kind === "insurance"
                ? "Verify the certificate, coverage limit, and validity for the contract period."
                : status === "verified"
                  ? "Cross-check this evidence against the complete official tender package."
                  : `Obtain and review evidence for ${r.text.toLowerCase()}.`;
        const why =
          status === "verified"
            ? "The declared profile satisfies this structured check. Original documents still require human verification."
            : status === "human_review"
              ? "Applicability and interpretation cannot be established from the structured profile. A human must review the original requirement."
              : status === "hard_blocker"
                ? "The declared profile does not satisfy this requirement. A mandatory hard stop overrides the readiness score."
                : "The profile does not contain sufficient prepared evidence to verify this item.";
        return (
          <details className="ledger-item" data-demo={`requirement-${r.id}`} key={r.id}>
            <summary>
              <span className="ledger-requirement">
                <strong>{r.text}</strong>
                <small>
                  {r.mandatory ? "Mandatory" : "Non-mandatory"} · View evidence
                  +
                </small>
              </span>
              <span>
                <span className={`requirement-status ${status}`} data-demo={`status-${r.id}`}>
                  {statusLabels[status]}
                </span>
              </span>
              <span className="ledger-evidence">{evidenceFor(r)}</span>
              <span className="ledger-source" data-demo={`source-${r.id}`}>
                <small>Sample requirement reference</small>
                {r.sourceReference}
              </span>
              <span className="ledger-action" data-demo={`action-${r.id}`}>{action}</span>
            </summary>
            <div className="ledger-expanded">
              <div>
                <h3>Requirement text</h3>
                <p>{r.text}</p>
                <h3>Company evidence currently available</h3>
                <p>{evidenceFor(r)}</p>
              </div>
              <div>
                <h3>Why this status was assigned</h3>
                <p>{why}</p>
                <h3>Source context</h3>
                <p>
                  Sample requirement reference: {r.sourceReference}.
                  Illustrative requirement in this demo record; no official
                  package has been reviewed.
                </p>
                <h3>Recommended next action</h3>
                <p>{action}</p>
              </div>
              <p className="ledger-authority" data-demo={`authority-${r.id}`}>
                The original tender remains authoritative. Verify the complete
                package, amendments, deadlines, and submission instructions.
              </p>
            </div>
          </details>
        );
      })}
    </section>
  );
}
