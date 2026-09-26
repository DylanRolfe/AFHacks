"use client";

import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import { useCompany } from "./company-provider";
import { tenders } from "@/data/tenders";
import { calculateMatch } from "@/lib/matching";
import { outcomeLabels } from "@/lib/readiness";
import { dateLabel, daysUntil, deadlineLabel } from "@/lib/utils";

const shortStatus = {
  ready: "Ready to prepare",
  review: "Needs verification",
  blocker: "Blocked",
} as const;

export function Overview() {
  const { company } = useCompany();
  const checks = tenders.map((tender) => ({
    tender,
    match: calculateMatch(company, tender),
  }));
  const upcoming = checks
    .filter(({ tender }) => daysUntil(tender.closingDate) >= 0)
    .sort((a, b) => a.tender.closingDate.localeCompare(b.tender.closingDate));
  const priority =
    upcoming.find(({ match }) => match.decision !== "ready") ??
    upcoming[0] ??
    checks.find(({ match }) => match.decision !== "ready") ??
    checks[0];
  const others = checks
    .filter(({ tender }) => tender.id !== priority?.tender.id)
    .sort((a, b) => b.match.score - a.match.score)
    .slice(0, 3);
  const unverified = priority?.tender.requirements.filter(
    (requirement) =>
      requirement.mandatory &&
      priority.match.requirementStatuses[requirement.id] !== "verified",
  ).length ?? 0;
  const reason = unverified
    ? `${unverified === 1 ? "One mandatory item is" : `${unverified === 2 ? "Two" : unverified} mandatory items are`} not yet verified.`
    : "All mandatory items are verified. Confirm the official tender before preparing a bid.";

  return (
    <div className="overview-page">
      <header className="overview-header">
        <div>
          <p className="overview-greeting">Good morning, {company.name}</p>
          <h1>Your next action</h1>
          <p className="overview-intro">
            {priority?.match.decision === "review" && unverified === 1
              ? "One tender needs evidence before proposal work can begin."
              : priority?.match.decision === "blocker"
                ? "A tender has a mandatory requirement to resolve before proposal work begins."
                : priority?.match.decision === "review"
                  ? "A tender needs evidence before proposal work can begin."
                  : "Your tender checks are ready for review."}
          </p>
        </div>
        <Link href="/profile" className="overview-profile-link">
          Edit company profile
        </Link>
      </header>

      {priority && (
        <section className="priority-card" aria-labelledby="priority-title">
          <span className={`priority-label ${priority.match.decision}`}>
            {priority.match.decision === "ready" ? "Next closing tender" : "Needs attention"}
          </span>
          <h2 id="priority-title">{priority.tender.title}</h2>
          <p className="priority-buyer">{priority.tender.buyer}</p>
          <h3>{outcomeLabels[priority.match.decision]}</h3>
          <p className="priority-reason">{reason}</p>
          <div className="priority-footer">
            <span className="priority-deadline">
              Closes {dateLabel(priority.tender.closingDate)} · {deadlineLabel(priority.tender.closingDate)}
            </span>
            <Link className="priority-action" href={`/opportunities/${priority.tender.id}`}>
              Review readiness check <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </section>
      )}

      <section className="other-checks" aria-labelledby="other-checks-title">
        <h2 id="other-checks-title">Other tender checks</h2>
        <div className="other-checks-list">
          {others.map(({ tender, match }) => (
            <Link
              className="other-check-row"
              href={`/opportunities/${tender.id}`}
              key={tender.id}
            >
              <span className="other-check-name">
                <strong>{tender.title}</strong>
                <small>{tender.buyer}</small>
              </span>
              <span className={`other-check-status ${match.decision}`}>
                {shortStatus[match.decision]}
              </span>
              <span className="other-check-date">Closes {dateLabel(tender.closingDate)}</span>
              <ChevronRight size={18} aria-hidden="true" />
            </Link>
          ))}
        </div>
        <Link className="all-checks-link" href="/opportunities">
          View all tender checks <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </section>
    </div>
  );
}
