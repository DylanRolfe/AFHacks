import { Check, CircleHelp, X } from "lucide-react";
import type { MatchResult, Tender } from "@/types/procurement";
export function RequirementsList({
  tender,
  match,
}: {
  tender: Tender;
  match: MatchResult;
}) {
  const verified = Object.values(match.requirementStatuses).filter(
    (s) => s === "verified",
  ).length;
  return (
    <section className="panel requirements-panel">
      <div className="panel-heading">
        <h2>Requirements & evidence</h2>
        <span className="panel-meta">
          {verified} of {tender.requirements.length} verified
        </span>
      </div>
      <div className="requirements-list">
        {tender.requirements.map((r) => {
          const status = match.requirementStatuses[r.id];
          const Icon =
            status === "verified"
              ? Check
              : status === "not_met"
                ? X
                : CircleHelp;
          return (
            <div className="requirement-row" key={r.id}>
              <span className={`requirement-icon ${status}`}>
                <Icon size={15} />
              </span>
              <div>
                <h3>{r.text}</h3>
                <p>
                  {r.mandatory ? "Mandatory" : "Rated requirement"}
                  <span>·</span>
                  {r.sourceReference}
                </p>
              </div>
              <span className={`requirement-status ${status}`}>
                {status === "verified"
                  ? "Verified"
                  : status === "not_met"
                    ? "Not met"
                    : "Needs evidence"}
              </span>
            </div>
          );
        })}
      </div>
      <div className="panel-footnote">
        Verified against your declared profile. Section references belong to the
        illustrative demo notice.
      </div>
    </section>
  );
}
