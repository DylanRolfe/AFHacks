"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ChevronRight,
  CircleHelp,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { useCompany } from "./company-provider";
import { tenders } from "@/data/tenders";
import { calculateMatch } from "@/lib/matching";
import { dateLabel, deadlineLabel } from "@/lib/utils";
import { DecisionBadge, EmptyState, PageHeader } from "./ui";
import { Dialog } from "./dialog";
import { MethodologyContent } from "./methodology";
export function OpportunityList() {
  const { company } = useCompany();
  const [search, setSearch] = useState("");
  const [source, setSource] = useState("");
  const [sector, setSector] = useState("");
  const [location, setLocation] = useState("");
  const [decision, setDecision] = useState("");
  const [sort, setSort] = useState("best");
  const [methodology, setMethodology] = useState(false);
  useEffect(() => {
    const d = new URLSearchParams(window.location.search).get("decision");
    if (d && ["ready", "review", "blocker"].includes(d)) setDecision(d);
  }, []);
  const ranked = useMemo(
    () =>
      tenders.map((tender) => ({
        tender,
        match: calculateMatch(company, tender),
      })),
    [company],
  );
  const filtered = ranked
    .filter(
      ({ tender: t, match: m }) =>
        (!search ||
          `${t.title} ${t.buyer} ${t.tenderNumber} ${t.description}`
            .toLowerCase()
            .includes(search.toLowerCase())) &&
        (!source || t.source === source) &&
        (!sector || t.sector === sector) &&
        (!location || t.location === location) &&
        (!decision || m.decision === decision),
    )
    .sort((a, b) =>
      sort === "closing"
        ? a.tender.closingDate.localeCompare(b.tender.closingDate)
        : sort === "newest"
          ? b.tender.publishedDate.localeCompare(a.tender.publishedDate)
          : b.match.score - a.match.score,
    );
  function reset() {
    setSearch("");
    setSource("");
    setSector("");
    setLocation("");
    setDecision("");
  }
  const active = !!(search || source || sector || location || decision);
  return (
    <>
      <PageHeader
        eyebrow="PRE-BID READINESS"
        title="Check the requirements before you commit."
        description={`Compare Demo tender records with ${company.name}'s declared evidence before proposal work begins.`}
        action={
          <button
            className="button secondary"
            onClick={() => setMethodology(true)}
          >
            <CircleHelp size={16} />
            How readiness works
          </button>
        }
      />
      <div className="opportunity-tabs">
        <button
          className={!decision ? "selected" : ""}
          onClick={() => setDecision("")}
        >
          All opportunities<span>{tenders.length}</span>
        </button>
        <button
          className={decision === "ready" ? "selected" : ""}
          onClick={() => setDecision("ready")}
        >
          Ready to prepare a bid
          <span>
            {ranked.filter((r) => r.match.decision === "ready").length}
          </span>
        </button>
      </div>
      <section className="panel list-panel">
        <div className="list-controls">
          <div className="search-field">
            <Search size={18} />
            <input
              type="search"
              aria-label="Search opportunities"
              placeholder="Search opportunities"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="filter-row">
            <SlidersHorizontal size={16} />
            {[
              {
                label: "Source",
                value: source,
                setter: setSource,
                options: ["CanadaBuys", "Ontario Tenders"],
              },
              {
                label: "Sector",
                value: sector,
                setter: setSector,
                options: [...new Set(tenders.map((t) => t.sector))],
              },
              {
                label: "Location",
                value: location,
                setter: setLocation,
                options: [...new Set(tenders.map((t) => t.location))],
              },
              {
                label: "Decision",
                value: decision,
                setter: setDecision,
                options: ["ready", "review", "blocker"],
              },
            ].map((f) => (
              <select
                key={f.label}
                aria-label={f.label}
                value={f.value}
                onChange={(e) => f.setter(e.target.value)}
              >
                <option value="">{f.label}</option>
                {f.options.map((o) => (
                  <option key={o} value={o}>
                    {o[0].toUpperCase() + o.slice(1)}
                  </option>
                ))}
              </select>
            ))}
            {active && (
              <button className="clear-filters" onClick={reset}>
                Clear
              </button>
            )}
          </div>
        </div>
        <div className="results-toolbar">
          <span aria-live="polite">
            {filtered.length}{" "}
            {filtered.length === 1 ? "opportunity" : "opportunities"}
            <span className="results-muted"> matched to your profile</span>
          </span>
          <label>
            Sort by{" "}
            <select
              aria-label="Sort opportunities"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="best">Highest readiness</option>
              <option value="closing">Closing soon</option>
              <option value="newest">Newest</option>
            </select>
          </label>
        </div>
        {filtered.length ? (
          <div className="opportunity-results">
            <div className="result-column-headings">
              <span>BID READINESS</span>
              <span>OPPORTUNITY</span>
              <span>CLOSING DATE</span>
              <span />
            </div>
            {filtered.map(({ tender, match }) => (
              <Link
                href={`/opportunities/${tender.id}`}
                className="opportunity-row"
                key={tender.id}
              >
                <div className="row-score">
                  <strong>
                    {match.score}
                    <span>%</span>
                  </strong>
                  <DecisionBadge decision={match.decision} />
                </div>
                <div className="row-description">
                  <div className="row-title">
                    <h3>{tender.title}</h3>
                  </div>
                  <p>
                    {tender.buyer}
                    <span> · {tender.source}</span>
                  </p>
                  <div className="row-tags">
                    <span>{tender.sector}</span>
                    <span>{tender.location}</span>
                    <small>{tender.tenderNumber}</small>
                  </div>
                  <p className="row-explanation">{match.summary}</p>
                </div>
                <div className="row-deadline">
                  <strong>{dateLabel(tender.closingDate, true)}</strong>
                  <small>{deadlineLabel(tender.closingDate)}</small>
                </div>
                <ChevronRight className="row-chevron" size={18} />
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState reset={reset} />
        )}
      </section>
      <div className="list-source-note">
        <CircleHelp size={15} />
        <p>
          <strong>Demo tender dataset.</strong> Illustrative notices based on
          public procurement formats. Always verify details in the original
          notice.
        </p>
        <Link href="/methodology">
          About our sources
          <ArrowRight size={14} />
        </Link>
      </div>
      <Dialog
        open={methodology}
        onClose={() => setMethodology(false)}
        title="How readiness works"
      >
        <MethodologyContent />
      </Dialog>
    </>
  );
}
