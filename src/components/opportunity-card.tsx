import Link from "next/link";
import { ArrowUpRight, CalendarDays, Leaf, MapPin } from "lucide-react";
import type { MatchResult, Tender } from "@/types/procurement";
import { dateLabel } from "@/lib/utils";
import { DecisionBadge } from "./ui";
export function OpportunityCard({
  tender,
  match,
  featured = false,
}: {
  tender: Tender;
  match: MatchResult;
  featured?: boolean;
}) {
  return (
    <Link
      className={`opportunity-card ${featured ? "featured" : ""}`}
      href={`/opportunities/${tender.id}`}
    >
      <div className="opportunity-card-top">
        <span className="sector-icon">
          <Leaf size={20} />
        </span>
        <div className="card-badges">
          <DecisionBadge decision={match.decision} />
          <span className={`match-inline ${match.decision}`}>
            <strong>{match.score}%</strong> match
          </span>
        </div>
      </div>
      <h3>{tender.title}</h3>
      <p className="buyer">{tender.buyer}</p>
      <div className="opportunity-meta">
        <span>
          <MapPin size={13} />
          {tender.location}
        </span>
        <span>
          <CalendarDays size={13} />
          Closes {dateLabel(tender.closingDate)}
        </span>
        <span className="source-mini">{tender.source}</span>
      </div>
      <div className="opportunity-card-bottom">
        <p>{match.summary}</p>
        <span className="card-arrow" aria-label="View analysis">
          <ArrowUpRight size={20} />
        </span>
      </div>
    </Link>
  );
}
