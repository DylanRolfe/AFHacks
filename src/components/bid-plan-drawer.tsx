"use client";
import { useState } from "react";
import { Check, Copy, ListChecks } from "lucide-react";
import type { CompanyProfile, MatchResult, Tender } from "@/types/procurement";
import { createBidPlan, formatBidPlan } from "@/lib/bid-plan";
import { Dialog } from "./dialog";
export function BidPlanDrawer({
  open,
  onClose,
  company,
  tender,
  match,
  completed,
  setCompleted,
}: {
  open: boolean;
  onClose: () => void;
  company: CompanyProfile;
  tender: Tender;
  match: MatchResult;
  completed: string[];
  setCompleted: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const phases = createBidPlan(company, tender, match);
  async function copy() {
    try {
      await navigator.clipboard.writeText(
        formatBidPlan(company, tender, match, completed),
      );
      setCopied(true);
      setCopyError(false);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopyError(true);
    }
  }
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`Readiness plan for ${tender.title}`}
      drawer
    >
      <p className="dialog-description">
        A practical path to resolve or verify requirements before proposal work.
        Suggested internal timing and owners; confirm details in the original
        tender. Completing a task does not change the ledger status.
      </p>
      <div className="plan-owner">
        <ListChecks size={18} />
        <span>
          Prepared for <strong>{company.name}</strong>
        </span>
      </div>
      {match.decision !== "ready" && (
        <div className="blocker-note">
          Fix or verify mandatory items before starting response work.
        </div>
      )}
      <div className="plan-phases">
        {phases.map((p, i) => (
          <section key={p.title}>
            <span className="phase-number">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <div className="phase-heading">
                <h3>{p.title}</h3>
                <small>{p.timing}</small>
              </div>
              <p className="plan-task-owner">Owner: {p.owner}</p>
              <ul>
                {p.tasks.map((task, j) => {
                  const id = `${i}-${j}`;
                  return (
                    <li key={task}>
                      <label className="plan-task">
                        <input
                          type="checkbox"
                          checked={completed.includes(id)}
                          disabled={
                            i === phases.length - 1 &&
                            match.decision !== "ready"
                          }
                          onChange={() =>
                            setCompleted((prev) =>
                              prev.includes(id)
                                ? prev.filter((v) => v !== id)
                                : [...prev, id],
                            )
                          }
                        />
                        <span>
                          {task}
                          <small>
                            {completed.includes(id)
                              ? "Complete"
                              : i === phases.length - 1 &&
                                  match.decision !== "ready"
                                ? "Waiting for mandatory verification"
                                : "To do"}
                          </small>
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>
        ))}
      </div>
      <div className="drawer-bottom">
        <p className="fine-print">
          Demo guidance. Verify requirements and the exact closing time in the
          original solicitation.
        </p>
        <button className="button primary full-width" onClick={copy}>
          {copied ? <Check size={16} /> : <Copy size={16} />}
          <span aria-live="polite">{copied ? "Copied" : "Copy plan"}</span>
        </button>
        {copyError && (
          <div role="status">
            <p>
              Clipboard access is unavailable. Select and copy your plan below.
            </p>
            <textarea
              className="copy-fallback"
              aria-label="Plan text to copy"
              readOnly
              value={formatBidPlan(company, tender, match, completed)}
              onFocus={(e) => e.currentTarget.select()}
            />
          </div>
        )}
      </div>
    </Dialog>
  );
}
