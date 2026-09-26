import { test } from "node:test";
import assert from "node:assert/strict";
import { defaultCompany } from "../src/data/company";
import { tenders } from "../src/data/tenders";
import { calculateMatch, profileReadiness } from "../src/lib/matching";
import { daysUntil, reviewDate } from "../src/lib/utils";
import { formatBidPlan } from "../src/lib/bid-plan";

test("sample has two mandatory gaps with distinct evidence and human-review statuses", () => {
  const result = calculateMatch(defaultCompany, tenders[0]);
  assert.equal(result.decision, "review");
  assert.equal(result.requirementStatuses.registration, "verified");
  assert.equal(result.requirementStatuses.insurance, "verified");
  assert.equal(result.requirementStatuses.projects, "missing_evidence");
  assert.equal(result.requirementStatuses.security, "human_review");
  assert.equal(
    result.summary,
    "Two mandatory items are not yet verified. Resolve these gaps before assigning proposal-writing time.",
  );
});
test("all mandatory checks verified is ready even with a low supporting score", () => {
  const tender = { ...tenders[0], requirements: [tenders[0].requirements[0]] };
  const result = calculateMatch(
    { ...defaultCompany, capabilities: [], projects: [], employeeCount: 1 },
    tender,
  );
  assert.ok(result.score < 70);
  assert.equal(result.decision, "ready");
});
test("optional gaps cannot block verified mandatory requirements", () => {
  const tender = {
    ...tenders[0],
    requirements: [
      tenders[0].requirements[0],
      {
        ...tenders[0].requirements.find((r) => r.kind === "security")!,
        mandatory: false,
      },
    ],
  };
  assert.equal(calculateMatch(defaultCompany, tender).decision, "ready");
});
test("unknown requirement checks require human review instead of default verification", () => {
  const tender = {
    ...tenders[0],
    requirements: [
      {
        id: "unknown",
        text: "Check original terms",
        mandatory: true,
        sourceReference: "Sample annex",
      },
    ],
  };
  assert.equal(
    calculateMatch(defaultCompany, tender).requirementStatuses.unknown,
    "human_review",
  );
  assert.equal(calculateMatch(defaultCompany, tender).decision, "review");
});
test("an unmet mandatory registration or geography overrides a high fit score", () => {
  for (const company of [
    {
      ...defaultCompany,
      certifications: defaultCompany.certifications.filter(
        (c) => c !== "Ontario business registration",
      ),
    },
    { ...defaultCompany, regions: ["Québec"] },
  ]) {
    const result = calculateMatch(company, tenders[0]);
    assert.equal(result.decision, "blocker");
    assert.ok(result.score < 85);
    assert.match(result.summary, /Hard stop/);
  }
});
test("insurance limits and expiry affect mandatory eligibility", () => {
  assert.equal(
    calculateMatch(
      { ...defaultCompany, insuranceCoverageMillions: 1 },
      tenders[0],
    ).requirementStatuses.insurance,
    "hard_blocker",
  );
  assert.equal(
    calculateMatch(
      { ...defaultCompany, insuranceExpiry: "2026-01-01" },
      tenders[0],
    ).decision,
    "blocker",
  );
  assert.equal(
    calculateMatch({ ...defaultCompany, insuranceExpiry: "" }, tenders[0])
      .requirementStatuses.insurance,
    "missing_evidence",
  );
});
test("capability edits lower service fit and evidence preparation raises the score", () => {
  const original = calculateMatch(defaultCompany, tenders[0]);
  assert.ok(
    calculateMatch({ ...defaultCompany, capabilities: [] }, tenders[0]).score <
      original.score,
  );
  const ready = calculateMatch(
    {
      ...defaultCompany,
      projects: defaultCompany.projects.map((p) => ({
        ...p,
        referenceReady: true,
      })),
    },
    tenders[0],
  );
  assert.equal(ready.requirementStatuses.projects, "verified");
  assert.equal(ready.projectEvidence, 100);
  assert.equal(ready.decision, "review");
  assert.equal(ready.requirementStatuses.security, "human_review");
  assert.ok(ready.score > 85);
});
test("missing comparable projects never appear verified and fallback reasons stay grounded", () => {
  const result = calculateMatch(
    { ...defaultCompany, projects: [] },
    tenders[0],
  );
  assert.equal(result.projectEvidence, 0);
  assert.equal(result.requirementStatuses.projects, "missing_evidence");
  assert.match(result.reasons[1], /^0 related projects/);
});
test("many unconfirmed descriptions cannot masquerade as verified references", () => {
  const company = {
    ...defaultCompany,
    projects: Array.from({ length: 20 }, (_, i) => ({
      ...defaultCompany.projects[0],
      id: String(i),
      referenceReady: false,
    })),
  };
  assert.equal(calculateMatch(company, tenders[0]).projectEvidence, 62);
});
test("matching is deterministic, bounded, and leaves its inputs unchanged", () => {
  const snapshot = JSON.stringify({ defaultCompany, tenders });
  for (const t of tenders) {
    const a = calculateMatch(defaultCompany, t);
    const b = calculateMatch(defaultCompany, t);
    assert.deepEqual(a, b);
    for (const v of [
      a.score,
      a.serviceFit,
      a.eligibility,
      a.projectEvidence,
      a.operationalFit,
    ])
      assert.ok(v >= 0 && v <= 100);
  }
  assert.equal(JSON.stringify({ defaultCompany, tenders }), snapshot);
});
test("dates and exported plans use the actual tender deadline", () => {
  assert.equal(daysUntil("2026-10-15", new Date("2026-09-26T23:00:00Z")), 19);
  assert.equal(daysUntil("2026-10-15", new Date("2026-10-16T00:00:00Z")), -1);
  assert.equal(reviewDate("2026-10-15"), "2026-10-13");
  const text = formatBidPlan(
    defaultCompany,
    tenders[0],
    calculateMatch(defaultCompany, tenders[0]),
  );
  assert.match(text, /DEMO DATA/);
  assert.match(text, /Resolve mandatory risks/);
  assert.match(text, /Verify insurance evidence/);
  assert.match(text, /Only after all mandatory items are verified/);
  assert.match(text, /Internal compliance review/);
  assert.match(text, /Tender §4.1/);
});

test("a project check cannot overwrite an existing mandatory hard stop", () => {
  const tender = {
    ...tenders[0],
    requirements: [
      {
        ...tenders[0].requirements.find((r) => r.kind === "projects")!,
        requiredCertifications: ["Required qualification"],
      },
    ],
  };
  const company = {
    ...defaultCompany,
    projects: defaultCompany.projects.map((p) => ({
      ...p,
      referenceReady: true,
    })),
  };
  assert.equal(calculateMatch(company, tender).decision, "blocker");
});
test("copied plan includes owners, timing, completion, and the mandatory gate", () => {
  const result = calculateMatch(defaultCompany, tenders[0]);
  const text = formatBidPlan(defaultCompany, tenders[0], result, ["0-0"]);
  assert.match(text, /Owner: Maya Chen/);
  assert.match(text, /Within three days/);
  assert.match(text, /\[x\] Confirm whether the security requirement applies/);
  assert.match(text, /Only after all mandatory items are verified/);
  assert.equal(result.decision, "review");
});
