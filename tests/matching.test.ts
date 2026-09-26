import { test } from "node:test";
import assert from "node:assert/strict";
import { defaultCompany } from "../src/data/company";
import { tenders } from "../src/data/tenders";
import { calculateMatch, profileReadiness } from "../src/lib/matching";
import { daysUntil, reviewDate } from "../src/lib/utils";
import { formatBidPlan } from "../src/lib/bid-plan";

test("the curated profile produces transparent target scores and decisions", () => {
  const expected = [
    [86, "pursue"],
    [79, "pursue"],
    [68, "partner"],
    [62, "partner"],
    [37, "pass"],
    [22, "pass"],
    [74, "pursue"],
    [71, "pursue"],
    [66, "partner"],
    [41, "pass"],
    [83, "pursue"],
    [73, "pursue"],
  ];
  tenders.forEach((t, i) => {
    const m = calculateMatch(defaultCompany, t);
    assert.deepEqual([m.score, m.decision], expected[i], t.id);
    assert.ok(m.reasons.length >= 2);
    assert.equal(
      Object.keys(m.requirementStatuses).length,
      t.requirements.length,
    );
  });
  assert.equal(
    tenders.filter((t) => {
      const m = calculateMatch(defaultCompany, t);
      return m.score >= 79 && m.decision === "pursue";
    }).length,
    3,
  );
  assert.equal(profileReadiness(defaultCompany), 78);
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
    assert.equal(result.decision, "pass");
    assert.ok(result.score < 86);
    assert.match(result.summary, /Mandatory gap/);
  }
});
test("insurance limits and expiry affect mandatory eligibility", () => {
  assert.equal(
    calculateMatch(
      { ...defaultCompany, insuranceCoverageMillions: 1 },
      tenders[0],
    ).requirementStatuses.insurance,
    "not_met",
  );
  assert.equal(
    calculateMatch(
      { ...defaultCompany, insuranceExpiry: "2026-01-01" },
      tenders[0],
    ).decision,
    "pass",
  );
  assert.equal(
    calculateMatch({ ...defaultCompany, insuranceExpiry: "" }, tenders[0])
      .requirementStatuses.insurance,
    "needs_evidence",
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
  assert.ok(ready.score > 86);
});
test("missing comparable projects never appear verified and fallback reasons stay grounded", () => {
  const result = calculateMatch(
    { ...defaultCompany, projects: [] },
    tenders[0],
  );
  assert.equal(result.projectEvidence, 0);
  assert.equal(result.requirementStatuses.projects, "needs_evidence");
  assert.match(result.reasons[1], /^0 related projects/);
});
test("many unconfirmed descriptions cannot masquerade as verified references", () => {
  const company = {
    ...defaultCompany,
    projects: Array.from({ length: 20 }, (_, i) => ({
      ...defaultCompany.projects[0],
      id: String(i),
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
  assert.match(text, /Qualify/);
  assert.match(text, /Prepare evidence/);
  assert.match(text, /Write response/);
  assert.match(text, /Review & submit/);
  assert.match(text, /Tender §4.1/);
});
