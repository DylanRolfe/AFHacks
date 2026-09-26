"use client";
import { outcomeLabels } from "@/lib/readiness";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  MapPin,
  Plus,
  Save,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import Link from "next/link";
import type { CompanyProfile } from "@/types/procurement";
import { useCompany } from "./company-provider";
import { PageHeader } from "./ui";
import { companySchema } from "@/lib/validation";
import { calculateMatch, profileReadiness } from "@/lib/matching";
import { dateLabel } from "@/lib/utils";
import { tenders } from "@/data/tenders";

function TagInput({
  label,
  values,
  onChange,
  placeholder,
}: {
  label: string;
  values: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
}) {
  const [text, setText] = useState("");
  function add() {
    const value = text.trim();
    if (
      value &&
      !values.some((v) => v.toLowerCase() === value.toLowerCase()) &&
      values.length < 30
    )
      onChange([...values, value]);
    setText("");
  }
  return (
    <div className="tag-field">
      <span className="field-label">{label}</span>
      <div className="editable-tags">
        {values.map((v) => (
          <span key={v}>
            {v}
            <button
              type="button"
              aria-label={`Remove ${v}`}
              onClick={() => onChange(values.filter((tag) => tag !== v))}
            >
              <X size={12} />
            </button>
          </span>
        ))}
        <div className="tag-entry">
          <input
            aria-label={`Add ${label.toLowerCase()}`}
            value={text}
            maxLength={100}
            placeholder={placeholder}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                add();
              }
            }}
          />
          <button
            type="button"
            aria-label={`Add ${label.toLowerCase()} tag`}
            onClick={add}
            disabled={!text.trim()}
          >
            <Plus size={17} />
          </button>
        </div>
      </div>
      <small>Type a value and press Enter or + to add it.</small>
    </div>
  );
}
export function ProfileForm() {
  const { company, saveCompany, hydrated } = useCompany();
  const [draft, setDraft] = useState<CompanyProfile>(company);
  const [saved, setSaved] = useState(false);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    setDraft(company);
  }, [company]);
  const match = useMemo(() => calculateMatch(draft, tenders[0]), [draft]);
  const dirty = JSON.stringify(draft) !== JSON.stringify(company);
  function update<K extends keyof CompanyProfile>(
    key: K,
    value: CompanyProfile[K],
  ) {
    setDraft((d) => ({ ...d, [key]: value }));
    setSaved(false);
    setNotice("");
  }
  function save(e: React.FormEvent) {
    e.preventDefault();
    const parsed = companySchema.safeParse(draft);
    if (!parsed.success) {
      setNotice(
        parsed.error.issues[0]?.message ?? "Please check your profile fields.",
      );
      return;
    }
    const persisted = saveCompany(parsed.data);
    setSaved(true);
    setNotice(
      persisted
        ? "Your profile is saved. Opportunity matches are up to date."
        : "Saved for this session. Your browser has disabled local storage.",
    );
  }
  return (
    <form onSubmit={save}>
      <PageHeader
        eyebrow="THE FOUNDATION OF YOUR FIT"
        title="Company profile"
        description="Keep your profile current to receive more accurate opportunities and bid-readiness guidance."
        action={
          <button className="button primary" type="submit" disabled={!hydrated}>
            {saved ? <Check size={16} /> : <Save size={16} />}{" "}
            {saved ? "Saved" : "Save changes"}
          </button>
        }
      />
      {notice && (
        <div
          className={`save-notice ${saved ? "success" : "error"}`}
          role="status"
        >
          {saved && <CheckCircle2 size={17} />} {notice}
        </div>
      )}
      <div className="profile-grid">
        <div className="profile-sections">
          <section className="panel profile-section">
            <div className="profile-section-heading">
              <span className="section-number">01</span>
              <div>
                <h2>Company basics</h2>
                <p>A little context for the opportunities ahead.</p>
              </div>
            </div>
            <div className="form-grid">
              <label>
                Company name
                <input
                  required
                  maxLength={200}
                  value={draft.name}
                  onChange={(e) => update("name", e.target.value)}
                />
              </label>
              <label>
                Headquarters
                <input
                  required
                  maxLength={200}
                  value={draft.headquarters}
                  onChange={(e) => update("headquarters", e.target.value)}
                />
              </label>
              <label>
                Team size
                <input
                  type="number"
                  min={1}
                  max={100000}
                  required
                  value={draft.employeeCount || ""}
                  onChange={(e) =>
                    update("employeeCount", Number(e.target.value))
                  }
                />
              </label>
              <label>
                Procurement contact
                <input
                  maxLength={200}
                  value={draft.procurementContact}
                  onChange={(e) => update("procurementContact", e.target.value)}
                />
              </label>
            </div>
            <TagInput
              label="Regions served"
              values={draft.regions}
              onChange={(v) => update("regions", v)}
              placeholder="Add a region"
            />
          </section>
          <section className="panel profile-section">
            <div className="profile-section-heading">
              <span className="section-number">02</span>
              <div>
                <h2>Services and capabilities</h2>
                <p>The work your team is equipped to deliver.</p>
              </div>
            </div>
            <TagInput
              label="Capabilities"
              values={draft.capabilities}
              onChange={(v) => update("capabilities", v)}
              placeholder="Add a capability"
            />
          </section>
          <section className="panel profile-section">
            <div className="profile-section-heading">
              <span className="section-number">03</span>
              <div>
                <h2>Qualifications</h2>
                <p>Credentials used to assess mandatory requirements.</p>
              </div>
            </div>
            <TagInput
              label="Certifications"
              values={draft.certifications}
              onChange={(v) => update("certifications", v)}
              placeholder="Add a qualification"
            />
            <div className="field-note">
              <ShieldCheck size={15} />
              Declared by your company. Keep supporting documents ready.
            </div>
          </section>
          <section className="panel profile-section">
            <div className="profile-section-heading">
              <span className="section-number">04</span>
              <div>
                <h2>Relevant project evidence</h2>
                <p>Specific outcomes make your experience easier to assess.</p>
              </div>
            </div>
            <div className="project-cards">
              {draft.projects.map((project, i) => (
                <div
                  className={`project-card ${i === 0 ? "recommended" : ""}`}
                  key={project.id}
                >
                  {i === 0 && (
                    <span className="project-recommendation">
                      <Sparkles size={12} />
                      Recommended for next tender
                    </span>
                  )}
                  <div className="project-card-header">
                    <h3>{project.title}</h3>
                    <span>{project.year}</span>
                  </div>
                  <p>
                    {project.clientType} <span>·</span> {project.valueRange}
                  </p>
                  <div className="project-outcome">{project.outcome}</div>
                  <label className="reference-checkbox">
                    <input
                      type="checkbox"
                      checked={!!project.referenceReady}
                      onChange={(e) =>
                        update(
                          "projects",
                          draft.projects.map((p) =>
                            p.id === project.id
                              ? { ...p, referenceReady: e.target.checked }
                              : p,
                          ),
                        )
                      }
                    />
                    Client reference prepared and available
                  </label>
                </div>
              ))}
            </div>
          </section>
          <section className="panel profile-section">
            <div className="profile-section-heading">
              <span className="section-number">05</span>
              <div>
                <h2>Readiness checks</h2>
                <p>A final check before you commit to a response.</p>
              </div>
            </div>
            <div className="form-grid">
              <label>
                Insurance expiration
                <input
                  type="date"
                  value={draft.insuranceExpiry}
                  onChange={(e) => update("insuranceExpiry", e.target.value)}
                />
              </label>
              <label>
                Professional liability coverage ($M)
                <input
                  type="number"
                  step="0.1"
                  min={0}
                  max={10000}
                  value={draft.insuranceCoverageMillions ?? ""}
                  onChange={(e) =>
                    update(
                      "insuranceCoverageMillions",
                      e.target.value === ""
                        ? undefined
                        : Number(e.target.value),
                    )
                  }
                />
              </label>
            </div>
            <p className="fine-print">
              Review the coverage amount, expiry, and policy scope against each
              solicitation before relying on your profile.
            </p>
            <p className="fine-print">
              Last reviewed:{" "}
              {company.lastReviewed
                ? dateLabel(company.lastReviewed, true)
                : "Not yet reviewed"}
              . Saving confirms your latest review.
            </p>
          </section>
          <div className="profile-bottom-save">
            <span>
              {dirty
                ? "You have unsaved changes"
                : "Your workspace profile is up to date"}
            </span>
            <button
              type="submit"
              className="button primary"
              disabled={!hydrated}
            >
              {saved ? <Check size={15} /> : <Save size={15} />}{" "}
              {saved ? "Saved" : "Save changes"}
            </button>
          </div>
        </div>
        <aside className="profile-preview">
          <section className="panel">
            <div className="profile-identity">
              <span className="company-avatar">
                <Building2 size={28} />
              </span>
              <h3>{draft.name || "Your company"}</h3>
              <p>
                <MapPin size={13} />
                {draft.headquarters || "Add your headquarters"}
              </p>
              <span className="profile-team">
                {draft.employeeCount} people · Canadian SME
              </span>
            </div>
            <div className="profile-preview-score">
              <span className="eyebrow">PROFILE READINESS</span>
              <strong>
                {profileReadiness(draft)}
                <span>/100</span>
              </strong>
              <div className="metric-track">
                <span style={{ width: `${profileReadiness(draft)}%` }} />
              </div>
            </div>
            <div className="profile-impact">
              <span className="eyebrow">
                <Sparkles size={13} />
                LIVE READINESS PREVIEW
              </span>
              <h4>{tenders[0].title}</h4>
              <div>
                <strong>{match.score}%</strong>
                <span className={`decision-badge ${match.decision}`}>
                  {outcomeLabels[match.decision]}
                </span>
              </div>
              <p>{match.summary}</p>
              <small>
                {dirty
                  ? "Save changes to apply this assessment across your workspace."
                  : "Changes to capabilities, coverage, and evidence update your readiness checks."}
              </small>
            </div>
            <Link href="/opportunities" className="panel-footer-link">
              Explore tender checks
              <ArrowRight size={15} />
            </Link>
          </section>
          <p className="profile-privacy">
            Your profile stays in this browser. Refreshing AI analysis sends it
            to the server and, when configured, OpenAI.
          </p>
        </aside>
      </div>
    </form>
  );
}
