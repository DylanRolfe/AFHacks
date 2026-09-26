"use client";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { useCompany } from "./company-provider";
import { profileReadiness } from "@/lib/matching";
import { StatusIcon } from "./ui";
export function ReadinessSnapshot() {
  const { company } = useCompany();
  const readiness = profileReadiness(company);
  const references = company.projects.filter((p) => p.referenceReady).length;
  const rows = [
    {
      title: "Capabilities",
      value: company.capabilities.length >= 4 ? "Strong" : "Add services",
      good: company.capabilities.length >= 4,
    },
    {
      title: "Past performance",
      value: references >= 2 ? "References ready" : "Prepare references",
      good: references >= 2,
    },
    {
      title: "Certifications",
      value:
        company.certifications.length >= 3
          ? "Complete"
          : "Review qualifications",
      good: company.certifications.length >= 3,
    },
    { title: "Insurance", value: "Verify expiry", good: false },
  ];
  return (
    <section className="panel readiness-panel">
      <div className="panel-heading">
        <h2>Readiness snapshot</h2>
        <ShieldCheck size={19} />
      </div>
      <div className="readiness-ring-wrap">
        <div
          className="readiness-ring"
          style={{ "--progress": `${readiness}%` } as React.CSSProperties}
        >
          <div>
            <strong>
              {readiness}
              <span>/100</span>
            </strong>
            <small>Bid readiness</small>
          </div>
        </div>
      </div>
      <div className="readiness-caption">
        <span className="small-dot" />A strong foundation to build on
      </div>
      <div className="readiness-rows">
        {rows.map((row) => (
          <div className="readiness-row" key={row.title}>
            <span>
              <StatusIcon good={row.good} />
              {row.title}
            </span>
            <small className={row.good ? "success-text" : "warning-text"}>
              {row.value}
            </small>
          </div>
        ))}
      </div>
      <Link href="/profile" className="panel-footer-link">
        View company profile
        <ArrowRight size={15} />
      </Link>
    </section>
  );
}
