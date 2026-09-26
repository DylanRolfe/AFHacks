"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronRight,
  FileText,
  MapPin,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import type { Tender } from "@/types/procurement";
import { useCompany } from "./company-provider";
import { calculateMatch } from "@/lib/matching";
import { dateLabel, deadlineLabel } from "@/lib/utils";
import { DATASET_DATE } from "@/data/tenders";
import { DecisionBadge, MetricBar } from "./ui";
import { RequirementsList } from "./requirements-list";
import { BidCoach } from "./bid-coach";
import { BidPlanDrawer } from "./bid-plan-drawer";
import { ProposalReview } from "./proposal-review";
export function TenderDetail({ tender }: { tender: Tender }) {
  const { company } = useCompany();
  const match = useMemo(
    () => calculateMatch(company, tender),
    [company, tender],
  );
  const [plan, setPlan] = useState(false);
  const [done, setDone] = useState<string[]>([]);
  return (
    <>
      <div className="detail-breadcrumb">
        <Link href="/opportunities">
          <ArrowLeft size={14} />
          Opportunities
        </Link>
        <ChevronRight size={13} />
        <span>{tender.tenderNumber}</span>
      </div>
      <div className="tender-header">
        <div>
          <div className="tender-eyebrow">
            <DecisionBadge decision={match.decision} />
            <span>{tender.sector}</span>
            <span className="demo-label">Demo opportunity</span>
          </div>
          <h1>{tender.title}</h1>
          <p>{tender.buyer}</p>
          <div className="tender-metadata">
            <span>
              <FileText size={14} />
              {tender.source === "CanadaBuys"
                ? "Federal"
                : "Ontario public sector"}
            </span>
            <span>
              <MapPin size={14} />
              {tender.location}
            </span>
            <span>
              <CalendarDays size={14} />
              Closes {dateLabel(tender.closingDate, true)}
            </span>
          </div>
        </div>
        <div className="tender-header-actions">
          <button className="button primary" onClick={() => setPlan(true)}>
            <Sparkles size={16} />
            Generate bid plan
          </button>
          <a
            className="button secondary"
            href={tender.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            View original tender
            <ArrowUpRight size={16} />
          </a>
          <small>Opens official portal · demo record</small>
        </div>
      </div>
      <section className={`analysis-hero ${match.decision}`}>
        <div className="analysis-main">
          <div className="analysis-eyebrow">
            <span className="small-dot" />
            YOUR FIT ASSESSMENT
          </div>
          <div className="analysis-score-line">
            <div className="hero-score">
              {match.score}
              <span>%</span>
            </div>
            <div>
              <h2>
                {match.decision === "pursue"
                  ? "Strong fit"
                  : match.decision === "partner"
                    ? "Potential with a partner"
                    : "Reconsider this opportunity"}
              </h2>
              <p>for {company.name}</p>
            </div>
          </div>
          <p className="analysis-summary">{match.summary}</p>
          <div className="metrics-grid">
            <MetricBar label="Service fit" value={match.serviceFit} />
            <MetricBar label="Eligibility" value={match.eligibility} />
            <MetricBar label="Project evidence" value={match.projectEvidence} />
            <MetricBar label="Operational fit" value={match.operationalFit} />
          </div>
          <Link className="score-methodology" href="/methodology">
            How this score is calculated
            <ArrowUpRight size={12} />
          </Link>
        </div>
        <div className="analysis-decision">
          <div className="decision-icon">
            <ShieldCheck size={23} />
          </div>
          <span className="eyebrow">RECOMMENDED DECISION</span>
          <h2>{match.decision[0].toUpperCase() + match.decision.slice(1)}</h2>
          <strong>
            {match.decision === "pursue"
              ? "A good opportunity to move forward."
              : match.decision === "partner"
                ? "The right partner can close the gap."
                : "Address mandatory gaps first."}
          </strong>
          <p>
            {match.decision === "pursue"
              ? "Your core qualifications align. Strengthen your supporting evidence before committing to a response."
              : match.summary}
          </p>
          <div className="decision-deadline">
            <CalendarDays size={15} />
            {deadlineLabel(tender.closingDate)}
          </div>
          <button
            className="button decision-button"
            onClick={() => setPlan(true)}
          >
            Start bid plan
            <ArrowRight size={16} />
          </button>
        </div>
      </section>
      <div className="detail-grid">
        <div className="detail-main">
          <RequirementsList tender={tender} match={match} />
          <section className="panel evaluation-panel">
            <div className="panel-heading">
              <h2>Evaluation priorities</h2>
              <span className="panel-meta">100% total weighting</span>
            </div>
            <div className="evaluation-list">
              {tender.evaluationCriteria.map((c, i) => (
                <div className="evaluation-row" key={c.name}>
                  <span className="evaluation-number">0{i + 1}</span>
                  <div>
                    <h3>{c.name}</h3>
                    <p>{c.suggestion}</p>
                  </div>
                  <strong>
                    {c.weight}
                    <span>%</span>
                  </strong>
                </div>
              ))}
            </div>
          </section>
          <section className="panel fit-panel">
            <div className="panel-heading">
              <h2>
                Why this is{" "}
                {match.decision === "pass" ? "not yet a fit" : "a fit"}
              </h2>
              <Sparkles size={17} />
            </div>
            <ul>
              {match.reasons.map((reason) => (
                <li key={reason}>
                  <Check size={15} />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </section>
          <ProposalReview tender={tender} />
        </div>
        <div className="detail-aside">
          <section className="panel actions-panel">
            <div className="panel-heading">
              <h2>Next actions</h2>
              <span className="panel-meta">
                {done.length} of {match.nextActions.length}
              </span>
            </div>
            <div className="actions-progress">
              <span
                style={{
                  width: `${(done.length / match.nextActions.length) * 100}%`,
                }}
              />
            </div>
            <div className="action-list">
              {match.nextActions.map((a) => (
                <label
                  key={a.id}
                  className={done.includes(a.id) ? "complete" : ""}
                >
                  <input
                    type="checkbox"
                    checked={done.includes(a.id)}
                    onChange={() =>
                      setDone((prev) =>
                        prev.includes(a.id)
                          ? prev.filter((id) => id !== a.id)
                          : [...prev, a.id],
                      )
                    }
                  />
                  <span>
                    <small>{a.timing}</small>
                    <span>{a.title}</span>
                  </span>
                </label>
              ))}
            </div>
            <div className="panel-footnote">
              {done.length} of {match.nextActions.length} complete · this
              session
            </div>
          </section>
          <BidCoach company={company} tender={tender} match={match} />
          <section className="panel tender-source">
            <div className="panel-heading">
              <h2>Tender source</h2>
              <FileText size={17} />
            </div>
            <div className="panel-body">
              <a
                href={tender.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {tender.source}
                <ArrowUpRight size={16} />
              </a>
              <p>Public notice portal · illustrative record</p>
              <small>Dataset prepared {dateLabel(DATASET_DATE, true)}</small>
              <p className="fine-print">
                No live notice accessed. Verify requirements, amendments, and
                the closing time on the official portal.
              </p>
            </div>
          </section>
        </div>
      </div>
      <BidPlanDrawer
        open={plan}
        onClose={() => setPlan(false)}
        company={company}
        tender={tender}
        match={match}
      />
    </>
  );
}
