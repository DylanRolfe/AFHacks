"use client";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  CircleHelp,
  Flag,
  SlidersHorizontal,
  Sparkles,
  Target,
} from "lucide-react";
import { useCompany } from "./company-provider";
import { tenders } from "@/data/tenders";
import { calculateMatch } from "@/lib/matching";
import { daysUntil, dateLabel } from "@/lib/utils";
import { PageHeader, SectionHeading } from "./ui";
import { OpportunityCard } from "./opportunity-card";
import { ReadinessSnapshot } from "./readiness-snapshot";
export function Overview() {
  const { company } = useCompany();
  const ranked = tenders
    .map((tender) => ({ tender, match: calculateMatch(company, tender) }))
    .sort((a, b) => b.match.score - a.match.score);
  const strong = ranked.filter(
    (r) => r.match.score >= 79 && r.match.decision === "pursue",
  ).length;
  const next = [...ranked]
    .filter((r) => daysUntil(r.tender.closingDate) >= 0)
    .sort((a, b) =>
      a.tender.closingDate.localeCompare(b.tender.closingDate),
    )[0];
  const gaps =
    (company.projects.filter((p) => p.referenceReady).length < 2 ? 1 : 0) + 1;
  return (
    <>
      <PageHeader
        eyebrow={`Good morning, ${company.name}`}
        title="Your next government contract is closer than you think."
        description={`We analyzed ${tenders.length} federal and Ontario opportunities against your declared capabilities.`}
        action={
          <Link className="button secondary" href="/profile">
            <SlidersHorizontal size={15} />
            Update company profile
          </Link>
        }
      />
      <div className="overview-status">
        <span className="live-dot" />
        Your opportunity briefing<span className="status-separator">/</span>
        <span>Demo tender dataset</span>
      </div>
      <div className="summary-grid">
        <Link href="/opportunities?decision=pursue" className="summary-card">
          <div className="summary-label">
            Strong opportunities
            <span className="summary-icon green">
              <Target size={19} />
            </span>
          </div>
          <div className="summary-value">
            {strong}
            <span className="summary-pill">79%+ match</span>
          </div>
          <p>
            High-fit opportunities to explore
            <ArrowUpRight size={16} />
          </p>
        </Link>
        <Link href="/profile" className="summary-card">
          <div className="summary-label">
            Readiness gaps
            <span className="summary-icon amber">
              <Flag size={18} />
            </span>
          </div>
          <div className="summary-value">
            {gaps}
            <span className="summary-subvalue">worth your attention</span>
          </div>
          <p>
            Evidence or qualifications to address
            <ArrowUpRight size={16} />
          </p>
        </Link>
        <Link
          href={next ? `/opportunities/${next.tender.id}` : "/opportunities"}
          className="summary-card"
        >
          <div className="summary-label">
            Next closing date
            <span className="summary-icon blue">
              <CalendarDays size={18} />
            </span>
          </div>
          <div className="summary-value">
            {next ? daysUntil(next.tender.closingDate) : "—"}
            <span className="summary-subvalue">
              {next ? "days away" : "No upcoming dates"}
            </span>
          </div>
          <p>
            {next ? next.tender.title : "Check the original portals"}
            <ArrowUpRight size={16} />
          </p>
        </Link>
      </div>
      <div className="dashboard-grid">
        <section>
          <SectionHeading
            title="Best-fit opportunities"
            count={3}
            href="/opportunities"
            linkLabel="View all opportunities"
          />
          <p className="section-description">
            The right work for what you do best.
          </p>
          <div className="opportunity-stack">
            {ranked.slice(0, 3).map((r, i) => (
              <OpportunityCard key={r.tender.id} {...r} featured={i === 0} />
            ))}
          </div>
        </section>
        <div className="dashboard-aside">
          <ReadinessSnapshot />
          <div className="next-step-card">
            <span className="eyebrow">
              <Sparkles size={14} /> YOUR NEXT MOVE
            </span>
            <h3>Turn a good fit into a clear plan.</h3>
            <p>
              See what you qualify for, what’s missing, and what to do next.
            </p>
            <Link
              href={`/opportunities/${ranked[0].tender.id}`}
              className="text-link"
            >
              Explore your top match
              <ArrowRight size={16} />
            </Link>
            <div className="next-step-date">
              <CalendarDays size={13} />
              Next close:{" "}
              {next
                ? dateLabel(next.tender.closingDate, true)
                : "None upcoming"}
            </div>
          </div>
        </div>
      </div>
      <div className="methodology-note">
        <CircleHelp size={21} />
        <div>
          <h3>Why this recommendation?</h3>
          <p>
            BidNorth ranks opportunities by mandatory eligibility, service fit,
            relevant project evidence, geography, and readiness. It does not
            predict award outcomes.
          </p>
        </div>
        <Link href="/methodology" aria-label="Read matching methodology">
          <ArrowUpRight size={19} />
        </Link>
      </div>
    </>
  );
}
