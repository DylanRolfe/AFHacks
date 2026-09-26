import { ArrowUpRight, Check, FileText, ShieldCheck } from "lucide-react";
import { METHODOLOGY, DATASET_DATE } from "@/data/tenders";
import { dateLabel } from "@/lib/utils";
export function MethodologyContent() {
  return (
    <div className="methodology-content">
      <p>{METHODOLOGY}</p>
      <div className="weight-grid">
        {[
          {
            label: "Service fit",
            weight: 35,
            desc: "Your capabilities and related project tags.",
          },
          {
            label: "Eligibility",
            weight: 30,
            desc: "Mandatory qualifications and delivery coverage.",
          },
          {
            label: "Project evidence",
            weight: 20,
            desc: "Comparable experience and prepared references.",
          },
          {
            label: "Operational fit",
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
      <h3>A score is a starting point. Requirements come first.</h3>
      <div className="decision-rules">
        <p>
          <span className="decision-badge pursue">Pursue</span>70+ with no unmet
          mandatory requirement.
        </p>
        <p>
          <span className="decision-badge partner">Partner</span>45–69, or a
          specialist gap a partner could address.
        </p>
        <p>
          <span className="decision-badge pass">Pass</span>Below 45, or any
          clearly unmet mandatory requirement.
        </p>
      </div>
      <p className="fine-print">
        “Needs evidence” means a claim still needs supporting material.
        “Verified” means matched to your declared demo profile, not
        independently certified. Missing references earn partial evidence
        credit; they are never represented as verified references.
      </p>
      <div className="source-disclosure">
        <FileText size={20} />
        <div>
          <h3>Demo tender dataset</h3>
          <p>
            These 12 illustrative opportunities are modeled on public
            procurement notice structures. Titles, dates, tender numbers,
            buyers, requirements, and section references are demo content, not
            verified live solicitations. Portal links are entry points, not
            links to matching records.
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
