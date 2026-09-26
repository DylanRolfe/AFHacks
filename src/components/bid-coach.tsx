"use client";
import { useEffect, useRef, useState } from "react";
import { RefreshCw, Sparkles } from "lucide-react";
import type {
  CoachInsight,
  CompanyProfile,
  MatchResult,
  Tender,
} from "@/types/procurement";
import { getFallbackInsight } from "@/lib/bid-coach-fallback";
import { coachSchema } from "@/lib/validation";
export function BidCoach({
  company,
  tender,
  match,
}: {
  company: CompanyProfile;
  tender: Tender;
  match: MatchResult;
}) {
  const [insight, setInsight] = useState<CoachInsight>(() =>
    getFallbackInsight(company, tender, match),
  );
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("Profile-based readiness guidance");
  const pending = useRef<AbortController | null>(null);
  useEffect(() => {
    pending.current?.abort();
    pending.current = null;
    setInsight(getFallbackInsight(company, tender, match));
    setMode("Profile-based readiness guidance");
    setLoading(false);
    return () => {
      pending.current?.abort();
      pending.current = null;
    };
  }, [company, tender, match]);
  async function refresh() {
    pending.current?.abort();
    const controller = new AbortController();
    pending.current = controller;
    setLoading(true);
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch("/api/bid-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company, tender, match }),
        signal: controller.signal,
      });
      if (!response.ok) throw new Error("Unavailable");
      const data = await response.json();
      const validated = coachSchema.parse(data.insight);
      if (pending.current !== controller) return;
      setInsight(validated);
      setMode(data.mode === "ai" ? "AI analysis · DeepSeek" : data.message);
    } catch {
      if (pending.current === controller) {
        setInsight(getFallbackInsight(company, tender, match));
        setMode("Live analysis unavailable · profile-based guidance");
      }
    } finally {
      clearTimeout(timeout);
      if (pending.current === controller) setLoading(false);
    }
  }
  return (
    <section className="panel coach-panel">
      <div className="panel-heading">
        <h2>
          <Sparkles size={18} />
          Readiness Coach
        </h2>
        <span className="coach-label">BIDNORTH</span>
      </div>
      <div className="coach-body" aria-live="polite" aria-busy={loading}>
        {loading ? (
          <div className="coach-skeleton" role="status">
            <span className="sr-only">Analyzing your profile and tender…</span>
            <i />
            <i />
            <i />
            <i />
          </div>
        ) : (
          <>
            <span className="coach-mode">{mode}</span>
            <h3>{insight.headline}</h3>
            <p>{insight.assessment}</p>
            <ol>
              {insight.priorityActions.map((action) => (
                <li key={action}>{action}</li>
              ))}
            </ol>
            <details>
              <summary>Watchouts to keep in mind</summary>
              <ul>
                {insight.watchouts.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            </details>
          </>
        )}
      </div>
      <div className="coach-bottom">
        <p>
          Guidance only. No eligibility determination, legal advice, or award
          prediction.
        </p>
        <button
          className="button secondary full-width"
          onClick={refresh}
          disabled={loading}
        >
          <RefreshCw size={14} className={loading ? "spin" : ""} />
          {loading ? "Reviewing readiness…" : "Refresh readiness check"}
        </button>
        <p>
          Recommendations are based on your profile and the tender information
          shown. Verify all requirements in the source notice.
        </p>
      </div>
    </section>
  );
}
