import { test, expect } from "@playwright/test";

test("overview, tender analysis, bid plan, clipboard, and coach fallback", async ({
  page,
  context,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/");
  await expect(
    page.locator(".summary-card").first().locator(".summary-value"),
  ).toContainText("3");
  await expect(page.locator(".readiness-ring")).toContainText("78");
  await expect(page.locator(".opportunity-card")).toHaveCount(3);
  await page.locator(".opportunity-card").first().click();
  await expect(
    page.getByRole("heading", {
      name: "Energy Efficiency Retrofit Services",
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.locator(".hero-score")).toHaveText("86%");
  await expect(page.locator(".requirement-status.needs_evidence")).toHaveCount(
    1,
  );
  await expect(page.locator(".analysis-decision h2")).toHaveText("Pursue");
  await page.getByRole("button", { name: "Generate bid plan" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(
    dialog.getByRole("heading", { name: "Prepare evidence", exact: true }),
  ).toBeVisible();
  await dialog.getByRole("button", { name: "Copy plan", exact: true }).click();
  await expect(
    dialog.getByRole("button", { name: "Copied", exact: true }),
  ).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
    "Tender §4.1",
  );
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(
    page.getByRole("button", { name: "Generate bid plan" }),
  ).toBeFocused();
  await page.locator(".action-list input").first().check();
  await expect(page.locator(".actions-panel .panel-footnote")).toContainText(
    "1 of 4 complete",
  );
  await page.getByRole("button", { name: "Refresh analysis" }).click();
  await expect(page.locator(".coach-mode")).toContainText(
    "no API key required",
  );
  await expect(page.locator(".coach-body h3")).toHaveText(
    "Strengthen the evidence, then pursue",
  );
  await page
    .getByRole("button", { name: "Review against tender criteria" })
    .click();
  await expect(page.locator(".proposal-results")).toContainText("Tender §4.1");
  expect(errors).toEqual([]);
});

test("search, all filter types, sorting, empty state and matching explanation", async ({
  page,
}) => {
  await page.goto("/opportunities");
  await expect(page.locator(".opportunity-row")).toHaveCount(12);
  await page.getByRole("searchbox").fill("no matching tender xyz");
  await expect(
    page.getByText("No opportunities match those filters."),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Clear filters", exact: true })
    .click();
  await expect(page.locator(".opportunity-row")).toHaveCount(12);
  await page.getByRole("searchbox").fill("Retrofit Services");
  await expect(page.locator(".opportunity-row")).toHaveCount(1);
  await page.getByRole("searchbox").clear();
  for (const [label, value] of [
    ["Source", "Ontario Tenders"],
    ["Sector", "Clean energy"],
    ["Location", "Ontario"],
    ["Decision", "pursue"],
  ]) {
    await page.getByLabel(label, { exact: true }).selectOption(value);
  }
  await expect(page.locator(".opportunity-row")).toHaveCount(2);
  await page.getByRole("button", { name: "Clear", exact: true }).click();
  await page.getByLabel("Sort opportunities").selectOption("closing");
  await expect(page.locator(".opportunity-row").first()).toContainText(
    "Energy Efficiency Retrofit Services",
  );
  await page.getByLabel("Sort opportunities").selectOption("newest");
  await expect(page.locator(".opportunity-row").first()).toContainText(
    "Sustainability Reporting Services",
  );
  await page.getByRole("button", { name: "How matching works" }).click();
  await expect(page.getByRole("dialog")).toContainText(
    "does not predict award outcomes",
  );
  await page.keyboard.press("Escape");
});

test("saved profile updates matching, survives reload, and can restore eligibility", async ({
  page,
}) => {
  await page.goto("/profile");
  await page
    .getByRole("button", { name: "Remove Ontario", exact: true })
    .click();
  await expect(page.locator(".profile-impact .decision-badge")).toHaveText(
    "pass",
  );
  await page
    .getByRole("button", { name: "Save changes", exact: true })
    .first()
    .click();
  await expect(page.getByRole("status")).toContainText("Your profile is saved");
  await page.goto("/opportunities/energy-retrofit");
  await expect(page.locator(".analysis-decision h2")).toHaveText("Pass");
  await page.reload();
  await expect(page.locator(".analysis-decision h2")).toHaveText("Pass");
  await page.goto("/profile");
  await page.getByLabel("Add regions served", { exact: true }).fill("Ontario");
  await page.getByLabel("Add regions served", { exact: true }).press("Enter");
  await page
    .getByLabel("Client reference prepared and available")
    .nth(0)
    .check();
  await page
    .getByLabel("Client reference prepared and available")
    .nth(1)
    .check();
  await page
    .getByRole("button", { name: "Save changes", exact: true })
    .first()
    .click();
  await page.goto("/opportunities/energy-retrofit");
  await expect(page.locator(".analysis-decision h2")).toHaveText("Pursue");
  expect(
    Number((await page.locator(".hero-score").innerText()).replace("%", "")),
  ).toBeGreaterThan(86);
  await expect(page.locator(".requirement-status.needs_evidence")).toHaveCount(
    0,
  );
});

test("corrupted local storage and failed coach requests leave a usable workspace", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem("bidnorth.company.v1", "{invalid"),
  );
  await page.goto("/opportunities/energy-retrofit");
  await expect(page.locator(".hero-score")).toHaveText("86%");
  await page.route("**/api/bid-coach", (route) =>
    route.fulfill({ status: 503, body: "Unavailable" }),
  );
  await page.getByRole("button", { name: "Refresh analysis" }).click();
  await expect(page.locator(".coach-mode")).toContainText(
    "Live analysis unavailable",
  );
  await expect(page.locator(".coach-body h3")).toBeVisible();
});

for (const width of [1440, 768, 390])
  test(`responsive layout remains usable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    for (const [path, label] of [
      ["/", "overview"],
      ["/opportunities", "opportunities"],
      ["/opportunities/energy-retrofit", "analysis"],
      ["/profile", "profile"],
    ]) {
      await page.goto(path);
      await expect(page.locator("h1")).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth,
      );
      expect(overflow, `${path} horizontal overflow`).toBe(false);
      await page.screenshot({
        path: `test-results/screenshots/${label}-${width}.png`,
        fullPage: true,
      });
    }
    if (width < 850) {
      await page
        .getByRole("button", { name: "Open menu", exact: true })
        .click();
      await page
        .getByRole("navigation")
        .getByRole("link", { name: "Overview", exact: true })
        .click();
      await expect(page).toHaveURL("/");
    }
  });

test("bad API inputs and unknown opportunities are handled without a crash", async ({
  request,
  page,
}) => {
  const invalid = await request.post("/api/bid-coach", {
    data: { company: {}, tender: { id: "missing" } },
  });
  expect(invalid.status()).toBe(400);
  const response = await page.goto("/opportunities/missing-opportunity");
  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("link", { name: "Browse opportunities" }),
  ).toBeVisible();
});
