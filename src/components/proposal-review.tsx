"use client";
import { useState } from "react";
import { FileCheck2 } from "lucide-react";
import type { Tender } from "@/types/procurement";
export function ProposalReview({ tender }: { tender: Tender }) {
  const [excerpt, setExcerpt] = useState(
    "Our team will begin with a discovery phase, establish a performance baseline, and deliver a phased implementation plan. We will use our analytics experience to measure results and provide clear progress reports to the buyer.",
  );
  const [reviewed, setReviewed] = useState(false);
  const project = tender.requirements.find((r) => r.kind === "projects");
  return (
    <section className="panel proposal-panel">
      <div className="panel-heading">
        <h2>
          <FileCheck2 size={18} />
          Proposal readiness check
        </h2>
        <span className="panel-meta">Demo review</span>
      </div>
      <div className="panel-body">
        <p className="section-description">
          Try a short technical approach. This local check highlights drafting
          cues; it does not verify compliance.
        </p>
        <label htmlFor="proposal-excerpt" className="sr-only">
          Proposal excerpt
        </label>
        <textarea
          id="proposal-excerpt"
          value={excerpt}
          onChange={(e) => {
            setExcerpt(e.target.value);
            setReviewed(false);
          }}
          rows={5}
        />
        <button
          className="button secondary"
          disabled={!excerpt.trim()}
          onClick={() => setReviewed(true)}
        >
          Review against tender criteria
        </button>
        {reviewed && (
          <div className="proposal-results" aria-live="polite">
            <div>
              <strong>Coverage</strong>
              <p>
                {/baseline|phased|milestone/i.test(excerpt)
                  ? "Your excerpt includes a delivery structure. "
                  : "Add a baseline, phases, and delivery milestones. "}
                {tender.evaluationCriteria[0].suggestion} (
                {tender.evaluationCriteria[0].weight}% rated criterion.)
              </p>
            </div>
            <div>
              <strong>Evidence</strong>
              <p>
                {/\d+%|reference|comparable/i.test(excerpt)
                  ? "An evidence cue is present; confirm the underlying source and client permission."
                  : "Add a comparable project, a quantified outcome, and a client reference."}{" "}
                {project
                  ? `Tie the evidence to ${project.sourceReference}.`
                  : "Tie this to the relevant-experience criterion."}
              </p>
            </div>
            <div>
              <strong>Compliance risks</strong>
              <p>
                A short excerpt cannot establish mandatory compliance.
                Cross-check{" "}
                {tender.requirements
                  .filter((r) => r.mandatory)
                  .map((r) => r.sourceReference)
                  .join(", ")}{" "}
                and the complete solicitation.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
