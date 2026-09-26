import { ArrowUpRight, FileText, ShieldCheck } from "lucide-react";
import { METHODOLOGY, DATASET_DATE } from "@/data/tenders";
import { dateLabel } from "@/lib/utils";

export function MethodologyContent() {
  return (
    <div className="methodology-content">
      <p>{METHODOLOGY}</p>
      <div className="weight-grid">
        {[
          {
            label: "Capability coverage",
            weight: 35,
            desc: "Declared capabilities and related project tags.",
          },
          {
            label: "Mandatory requirements",
            weight: 30,
            desc: "Required qualifications and delivery coverage.",
          },
          {
            label: "Company evidence",
            weight: 20,
            desc: "Comparable experience and prepared references.",
          },
          {
            label: "Delivery readiness",
            weight: 15,
            desc: "Geography, team capacity, and a named contact.",
          },
        ].map((w) => (
          <div key={w.label}>
            <strong>
              {w.weight}
              <span>%</span>
            </strong>
            <h3>{w.label}</h3>
            <p>{w.desc}</p>
          </div>
        ))}
      </div>
      <h3>Mandatory requirements gate the outcome.</h3>
      <div className="decision-rules">
        <p>
          <span className="decision-badge ready">Ready to prepare a bid</span>
          <span className="decision-rule-copy">
            All mandatory items are verified against the declared company
            profile.
          </span>
        </p>
        <p>
          <span className="decision-badge review">
            Fix gaps before committing proposal resources
          </span>
          <span className="decision-rule-copy">
            At least one mandatory item has missing evidence or needs human
            review.
          </span>
        </p>
        <p>
          <span className="decision-badge blocker">
            Do not commit proposal resources yet
          </span>
          <span className="decision-rule-copy">
            A mandatory requirement fails a structured check against the
            declared profile.
          </span>
        </p>
      </div>
      <p className="fine-print">
        “Missing evidence” and “Needs human review” mean evidence or the
        original tender must still be checked. “Verified” means matched to the
        declared demo profile, not independently certified. A tender is never
        marked “Ready to prepare a bid” while a mandatory item needs
        verification.
      </p>
      <div className="source-disclosure">
        <FileText size={20} />
        <div>
          <h3>Demo tender dataset</h3>
          <p>
            These 12 illustrative opportunities are modeled on public
            procurement notice structures. Titles, dates, tender numbers,
            buyers, requirements, and Sample requirement references are demo
            content, not verified live solicitations. Portal links are entry
            points, not links to matching records.
          </p>
          <small>
            Dataset prepared {dateLabel(DATASET_DATE, true)}. No live notice
            access or synchronization is claimed.
          </small>
        </div>
      </div>
      <div className="source-links">
        <a
          href="https://canadabuys.canada.ca/en/tender-opportunities"
          target="_blank"
          rel="noopener noreferrer"
        >
          CanadaBuys
          <ArrowUpRight size={15} />
        </a>
        <a
          href="https://ontariotenders.app.jaggaer.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Ontario Tenders
          <ArrowUpRight size={15} />
        </a>
      </div>
      <p className="fine-print">
        <ShieldCheck size={14} /> BidNorth does not submit bids, predict awards,
        or replace professional or legal review.
      </p>
    </div>
  );
}
