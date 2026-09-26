"use client";
import { defaultCompany } from "@/data/company";
import { outcomeLabels } from "@/lib/readiness";
import { METHODOLOGY } from "@/data/tenders";
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
import { dateLabel } from "@/lib/utils";
import { DATASET_DATE } from "@/data/tenders";
import { DecisionBadge } from "./ui";
import { RequirementsList } from "./requirements-list";
import { BidCoach } from "./bid-coach";
import { BidPlanDrawer } from "./bid-plan-drawer";
import { ProposalReview } from "./proposal-review";
export function TenderDetail({
  tender,
  sample = false,
}: {
  tender: Tender;
  sample?: boolean;
}) {
  const { company: savedCompany } = useCompany();
  const company = sample ? defaultCompany : savedCompany;
  const match = useMemo(
    () => calculateMatch(company, tender),
    [company, tender],
  );
  const [plan, setPlan] = useState(false);
  const [done, setDone] = useState<string[]>([]);
  const completedActions = match.nextActions.filter((a) =>
    done.includes(a.id),
  ).length;
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
            <span className="demo-label">Demo tender record</span>
            {sample && (
              <span className="demo-label">
                Fictional sample company · saved profile unchanged
              </span>
            )}
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
          <div className="package-metadata">
            <span>Tender number: {tender.tenderNumber}</span>
            <span>
              Sample package: v1 · {dateLabel(tender.publishedDate, true)}
            </span>
            <span>Last reviewed: {DATASET_DATE} · 09:00 ET (demo review)</span>
          </div>
        </div>
        <div className="tender-header-actions">
          <button className="button primary" onClick={() => setPlan(true)}>
            <Sparkles size={16} />
            Create readiness plan
          </button>
          <a
            className="button secondary"
            href={tender.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open official tender portal
            <ArrowUpRight size={16} />
          </a>
          <small>Opens official portal · demo record</small>
        </div>
      </div>
      <section className={`readiness-outcome ${match.decision}`}>
        <div>
          <span className="eyebrow">PRE-BID READINESS · {company.name}</span>
          <h2>{outcomeLabels[match.decision]}</h2>
          <p>{match.summary}</p>
          <a className="text-link" href="#readiness-ledger">
            Inspect the Readiness Ledger <ArrowRight size={16} />
          </a>
        </div>
        <div className="secondary-score">
          <span>{match.score}%</span>
          <small>Supporting readiness score</small>
          <Link href="/methodology">How this is assessed</Link>
        </div>
      </section>
      <RequirementsList tender={tender} match={match} company={company} />
      <p className="readiness-disclaimer">{METHODOLOGY}</p>
      <div className="detail-grid">
        <div className="detail-main">
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
                {match.decision === "blocker" ? "blocked" : "ready for review"}
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
          {match.decision === "ready" ? (
            <ProposalReview tender={tender} />
          ) : (
            <p className="readiness-disclaimer">
              Proposal-response drafting begins only after all mandatory items
              are verified.
            </p>
          )}
        </div>
        <div className="detail-aside">
          <section className="panel actions-panel">
            <div className="panel-heading">
              <h2>Next actions</h2>
              <span className="panel-meta">
                {completedActions} of {match.nextActions.length}
              </span>
            </div>
            <div className="actions-progress">
              <span
                style={{
                  width: `${(completedActions / match.nextActions.length) * 100}%`,
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
                    disabled={a.id === "4-0" && match.decision !== "ready"}
                    onChange={() =>
                      setDone((prev) =>
                        prev.includes(a.id)
                          ? prev.filter((id) => id !== a.id)
                          : [...prev, a.id],
                      )
                    }
                  />
                  <span>
                    <small>
                      {a.timing} · Owner: {a.owner}
                    </small>
                    <span>{a.title}</span>
                  </span>
                </label>
              ))}
            </div>
            <div className="panel-footnote">
              {completedActions} of {match.nextActions.length} complete · this
              session
            </div>
          </section>
          <BidCoach company={company} tender={tender} match={match} />
          <section className="panel tender-source">
            <div className="panel-heading">
              <h2>Original tender check</h2>
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
        completed={done}
        setCompleted={setDone}
      />
    </>
  );
}
