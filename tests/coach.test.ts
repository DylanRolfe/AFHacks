import { test } from "node:test";
import assert from "node:assert/strict";
import { defaultCompany } from "../src/data/company";
import { tenders } from "../src/data/tenders";
import { calculateMatch } from "../src/lib/matching";
import { generateCoach } from "../src/lib/coach-service";
import { getFallbackInsight } from "../src/lib/bid-coach-fallback";
import { POST } from "../src/app/api/bid-coach/route";
const tender = tenders[0];
const match = calculateMatch(defaultCompany, tender);

test("no API key produces useful deterministic guidance without any network call", async () => {
  const neverFetch: typeof fetch = async () => {
    throw new Error("Unexpected network call");
  };
  const result = await generateCoach(
    defaultCompany,
    tender,
    match,
    undefined,
    neverFetch,
  );
  assert.equal(result.mode, "fallback");
  assert.equal(result.insight.priorityActions.length, 3);
  assert.deepEqual(
    result.insight,
    getFallbackInsight(defaultCompany, tender, match),
  );
});
test("configured coach requests DeepSeek with JSON output", async () => {
  const insight = getFallbackInsight(defaultCompany, tender, match);
  const mock: typeof fetch = async (url, init) => {
    assert.equal(url, "https://api.deepseek.com/chat/completions");
    assert.equal(
      new Headers(init?.headers).get("authorization"),
      "Bearer test-key",
    );
    const body = JSON.parse(String(init?.body));
    assert.equal(body.model, "deepseek-flash");
    assert.deepEqual(body.thinking, { type: "disabled" });
    assert.deepEqual(body.response_format, { type: "json_object" });
    assert.match(body.messages[0].content, /JSON Schema/);
    assert.ok(init?.signal);
    return Response.json({
      choices: [{ message: { content: JSON.stringify(insight) } }],
    });
  };
  const result = await generateCoach(
    defaultCompany,
    tender,
    match,
    "test-key",
    mock,
  );
  assert.equal(result.mode, "ai");
  assert.deepEqual(result.insight, insight);
});
test("malformed JSON, empty responses, HTTP errors, network errors and timeout all fall back", async () => {
  const responses: Array<typeof fetch> = [
    async () => Response.json({}, { status: 429 }),
    async () =>
      Response.json({
        choices: [{ message: { content: "not json" } }],
      }),
    async () =>
      Response.json({
        choices: [{ message: { content: null } }],
      }),
    async () => Response.json({ choices: [] }),
    async () => {
      throw new Error("Network error");
    },
    async () => {
      throw new DOMException("Timed out", "TimeoutError");
    },
  ];
  for (const mock of responses) {
    const result = await generateCoach(
      defaultCompany,
      tender,
      match,
      "test-key",
      mock,
    );
    assert.equal(result.mode, "fallback");
    assert.deepEqual(
      result.insight,
      getFallbackInsight(defaultCompany, tender, match),
    );
  }
});
test("fallback does not claim eligibility after a profile loses mandatory qualifications", () => {
  const company = { ...defaultCompany, certifications: [] };
  const m = calculateMatch(company, tender);
  const insight = getFallbackInsight(company, tender, m);
  assert.match(insight.headline, /Do not commit proposal resources yet/);
  assert.match(insight.assessment, /Hard stop/);
  assert.doesNotMatch(insight.assessment, /meets the mandatory/);
});
test("API rejects malformed, oversized and unknown-tender requests safely", async () => {
  const invalid = [
    "oops",
    JSON.stringify({ company: {}, tender }),
    JSON.stringify({ company: defaultCompany, tender: { id: "missing" } }),
  ];
  for (const body of invalid) {
    const response = await POST(
      new Request("http://localhost/api/bid-coach", { method: "POST", body }),
    );
    assert.equal(response.status, 400);
    assert.ok((await response.json()).error);
  }
  const large = await POST(
    new Request("http://localhost/api/bid-coach", {
      method: "POST",
      body: "x".repeat(80001),
    }),
  );
  assert.equal(large.status, 413);
});

test("syntactically valid invented advice and eligibility claims are rejected", async () => {
  const insight = {
    ...getFallbackInsight(defaultCompany, tender, match),
    assessment:
      "You are legally eligible and will win. Obtain certification XYZ by October 1.",
  };
  const mock: typeof fetch = async () =>
    Response.json({
      choices: [{ message: { content: JSON.stringify(insight) } }],
    });
  const result = await generateCoach(
    defaultCompany,
    tender,
    match,
    "test",
    mock,
  );
  assert.equal(result.mode, "fallback");
  assert.deepEqual(
    result.insight,
    getFallbackInsight(defaultCompany, tender, match),
  );
});
