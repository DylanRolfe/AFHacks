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
test("configured coach requests the named model with strict structured outputs", async () => {
  const insight = {
    headline: "Strengthen evidence, then pursue",
    assessment:
      "Review the supporting evidence. Confirm the complete tender before drafting.",
    priorityActions: [
      "Prepare references",
      "Confirm insurance",
      "Draft approach",
    ],
    watchouts: ["Verify official notice", "Review mandatory evidence"],
  };
  const mock: typeof fetch = async (url, init) => {
    assert.equal(url, "https://api.openai.com/v1/responses");
    const body = JSON.parse(String(init?.body));
    assert.equal(body.model, "gpt-6-astra");
    assert.equal(body.text.format.strict, true);
    assert.equal(body.store, false);
    assert.ok(init?.signal);
    return Response.json({
      status: "completed",
      output: [
        { type: "reasoning" },
        {
          type: "message",
          content: [{ type: "output_text", text: JSON.stringify(insight) }],
        },
      ],
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
test("malformed JSON, refusal, HTTP errors, network errors and timeout all fall back", async () => {
  const responses: Array<typeof fetch> = [
    async () => Response.json({}, { status: 429 }),
    async () =>
      Response.json({
        status: "completed",
        output: [
          {
            type: "message",
            content: [{ type: "output_text", text: "not json" }],
          },
        ],
      }),
    async () =>
      Response.json({
        status: "completed",
        output: [
          { type: "message", content: [{ type: "refusal", refusal: "No" }] },
        ],
      }),
    async () => Response.json({ status: "incomplete", output: [] }),
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
  assert.match(insight.headline, /blockers/);
  assert.match(insight.assessment, /Mandatory gap/);
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
