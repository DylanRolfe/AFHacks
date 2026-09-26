import { ArrowRight, Check, CircleHelp, SearchX } from "lucide-react";
import Link from "next/link";
import type { Decision } from "@/types/procurement";
export function DecisionBadge({ decision }: { decision: Decision }) {
  return (
    <span className={`decision-badge ${decision}`}>
      <span className="status-dot" />
      {decision[0].toUpperCase() + decision.slice(1)}
    </span>
  );
}
export function MetricBar({
  label,
  value,
  note,
}: {
  label: string;
  value: number;
  note?: string;
}) {
  return (
    <div className="metric">
      <div className="metric-label">
        <span>
          {label}
          {note && <small> {note}</small>}
        </span>
        <strong>{value}%</strong>
      </div>
      <div
        className="metric-track"
        role="meter"
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <span style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="page-header">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {description && <p className="page-description">{description}</p>}
      </div>
      {action && <div className="page-header-action">{action}</div>}
    </div>
  );
}
export function EmptyState({ reset }: { reset: () => void }) {
  return (
    <div className="empty-state">
      <span className="empty-icon">
        <SearchX size={26} />
      </span>
      <h3>No opportunities match those filters.</h3>
      <p>Try a different search or broaden your filters.</p>
      <button className="button secondary" onClick={reset}>
        Clear filters
      </button>
    </div>
  );
}
export function SectionHeading({
  title,
  count,
  href,
  linkLabel,
}: {
  title: string;
  count?: number;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="section-heading">
      <h2>
        {title}
        {count !== undefined && <span className="count">{count}</span>}
      </h2>
      {href && (
        <Link className="text-link" href={href}>
          {linkLabel ?? "View all"}
          <ArrowRight size={15} />
        </Link>
      )}
    </div>
  );
}
export function StatusIcon({ good }: { good: boolean }) {
  return (
    <span className={`state-icon ${good ? "good" : "watch"}`}>
      {good ? <Check size={13} /> : <CircleHelp size={13} />}
    </span>
  );
}
