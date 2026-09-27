import { defaultCompany } from "../../src/data/company";
import { test, expect } from "@playwright/test";

test("overview, tender analysis, bid plan, clipboard, and coach fallback", async ({
  page,
  context,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/overview");
  await expect(page.getByRole("heading", { name: "Your next action" })).toBeVisible();
  await expect(page.locator(".priority-card")).toContainText(
    "Two mandatory items are not yet verified.",
  );
  await expect(page.locator(".other-check-row")).toHaveCount(3);
  await expect(page.locator(".readiness-ring")).toHaveCount(0);
  await page.getByRole("link", { name: "Review readiness check" }).click();
  await expect(page).toHaveURL(/\/opportunities\/energy-retrofit$/);
  await expect(
    page.getByRole("heading", {
      name: "Energy Efficiency Retrofit Services",
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.locator(".secondary-score > span")).toHaveText("83%");
  await expect(
    page.locator(".requirement-status.missing_evidence"),
  ).toHaveCount(1);
  await expect(page.locator(".readiness-outcome h2")).toHaveText(
    "Fix gaps before committing proposal resources",
  );
  await page.getByRole("button", { name: "Create readiness plan" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(
    dialog.getByRole("heading", {
      name: "Verify insurance evidence",
      exact: true,
    }),
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
    page.getByRole("button", { name: "Create readiness plan" }),
  ).toBeFocused();
  await page.locator(".action-list input").first().check();
  await expect(page.locator(".actions-panel .panel-footnote")).toContainText(
    "1 of 5 complete",
  );
  await page.getByRole("button", { name: "Refresh readiness check" }).click();
  await expect(page.locator(".coach-mode")).toContainText(
    "no API key required",
  );
  await expect(page.locator(".coach-body h3")).toHaveText(
    "Fix gaps before committing proposal resources",
  );
  await expect(
    page.getByText(
      "Proposal-response drafting begins only after all mandatory items are verified.",
    ),
  ).toBeVisible();
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
    ["Decision", "review"],
  ]) {
    await page.getByLabel(label, { exact: true }).selectOption(value);
  }
  await expect(page.locator(".opportunity-row")).toHaveCount(3);
  await page.getByRole("button", { name: "Clear", exact: true }).click();
  await page.getByLabel("Sort opportunities").selectOption("closing");
  await expect(page.locator(".opportunity-row").first()).toContainText(
    "Energy Efficiency Retrofit Services",
  );
  await page.getByLabel("Sort opportunities").selectOption("newest");
  await expect(page.locator(".opportunity-row").first()).toContainText(
    "Sustainability Reporting Services",
  );
  await page.getByRole("button", { name: "How readiness works" }).click();
  await expect(page.getByRole("dialog")).toContainText(
    "does not predict award outcomes",
  );
  await page.keyboard.press("Escape");
});

test("saved profile updates readiness, survives reload, and preserves human-review gate", async ({
  page,
}) => {
  await page.goto("/profile");
  await page
    .getByRole("button", { name: "Remove Ontario", exact: true })
    .click();
  await expect(page.locator(".profile-impact .decision-badge")).toHaveText(
    "Do not commit proposal resources yet",
  );
  await page
    .getByRole("button", { name: "Save changes", exact: true })
    .first()
    .click();
  await expect(page.getByRole("status")).toContainText("Your profile is saved");
  await page.goto("/opportunities/energy-retrofit");
  await expect(page.locator(".readiness-outcome h2")).toHaveText(
    "Do not commit proposal resources yet",
  );
  await page.reload();
  await expect(page.locator(".readiness-outcome h2")).toHaveText(
    "Do not commit proposal resources yet",
  );
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
  await expect(page.locator(".readiness-outcome h2")).toHaveText(
    "Fix gaps before committing proposal resources",
  );
  expect(
    Number(
      (await page.locator(".secondary-score > span").innerText()).replace(
        "%",
        "",
      ),
    ),
  ).toBeGreaterThan(83);
  await expect(
    page.locator(".requirement-status.missing_evidence"),
  ).toHaveCount(0);
});

test("corrupted local storage and failed coach requests leave a usable workspace", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem("bidnorth.company.v1", "{invalid"),
  );
  await page.goto("/opportunities/energy-retrofit");
  await expect(page.locator(".secondary-score > span")).toHaveText("83%");
  await page.route("**/api/bid-coach", (route) =>
    route.fulfill({ status: 503, body: "Unavailable" }),
  );
  await page.getByRole("button", { name: "Refresh readiness check" }).click();
  await expect(page.locator(".coach-mode")).toContainText(
    "Live analysis unavailable",
  );
  await expect(page.locator(".coach-body h3")).toBeVisible();
});

for (const width of [1440, 768, 390])
  test(`responsive layout remains usable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    for (const [path, label] of [
      ["/overview", "overview"],
      ["/about", "landing"],
      ["/opportunities", "opportunities"],
      ["/opportunities/energy-retrofit", "analysis"],
      ["/profile", "profile"],
    ]) {
      await page.goto(path);
      await expect(page.locator("h1")).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      if (label === "landing") {
        await page.locator(".story-hero-requirement").last().evaluate(async (element) => {
          await Promise.all(element.getAnimations().map((animation) => animation.finished));
        });
        const heroBottom = await page.locator(".story-hero").evaluate(
          (element) => element.getBoundingClientRect().bottom,
        );
        const ledgerBottom = await page.locator(".story-hero-ledger").evaluate(
          (element) => element.getBoundingClientRect().bottom,
        );
        expect(ledgerBottom, "readiness ledger stays inside the hero").toBeLessThanOrEqual(heroBottom);
      }
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
      await expect(page).toHaveURL("/overview");
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

test("public CTA opens the fictional sample without overwriting a saved company", async ({
  page,
}) => {
  await page.addInitScript(
    (company) =>
      localStorage.setItem("bidnorth.company.v1", JSON.stringify(company)),
    { ...defaultCompany, name: "Saved company", certifications: [] },
  );
  await page.goto("/");
  await expect(page).toHaveURL("/about");
  await expect(page.locator(".sidebar")).toHaveCount(0);
  await expect(
    page.getByRole("heading", {
      name: "Before you commit to a proposal, know what you can prove.",
    }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "See a sample readiness check", exact: true })
    .first()
    .click();
  await expect(page).toHaveURL(/energy-retrofit\?sample=1/);
  await expect(page.locator(".readiness-outcome h2")).toHaveText(
    "Fix gaps before committing proposal resources",
  );
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("bidnorth.company.v1")!).name,
    ),
  ).toBe("Saved company");
  const security = page
    .locator(".ledger-item")
    .filter({ hasText: "Security/clearance requirement" });
  await security.locator("summary").click();
  await expect(
    security.getByText("Why this status was assigned"),
  ).toBeVisible();
  await expect(
    security.getByText(/The original tender remains authoritative/),
  ).toBeVisible();
  await page.getByRole("button", { name: "Create readiness plan" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByText("Owner: Maya Chen").first()).toBeVisible();
  await dialog.getByRole("checkbox").first().check();
  await expect(dialog.getByText("Complete", { exact: true })).toBeVisible();
  await expect(dialog.getByRole("checkbox").last()).toBeDisabled();
});

test("public story reveals on scroll and respects reduced motion", async ({ page }) => {
  await page.goto("/about");
  await page.getByRole("link", { name: "Our mission" }).click();
  await expect(page).toHaveURL(/#mission$/);
  const phrases = page.locator("[data-manifesto-phrase]");
  await expect(phrases.first()).toHaveClass(/is-active|is-past/);
  await page.evaluate(() => {
    const mission = document.querySelector<HTMLElement>(".story-manifesto")!;
    document.documentElement.style.scrollBehavior = "auto";
    window.scrollTo(
      0,
      mission.offsetTop + (mission.offsetHeight - window.innerHeight) * 0.65,
    );
  });
  await expect(phrases.nth(1)).toHaveClass(/is-active|is-past/);
  const canada = page.locator(".story-canada .story-container");
  await canada.scrollIntoViewIfNeeded();
  await expect(canada).toHaveClass(/is-visible/);
  await expect(page.locator("[data-count='66.9']")).toHaveText("$66.9B");

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  const problem = page.locator(".story-problem .story-container");
  await expect(problem).toBeVisible();
  const duration = await page.locator(".story-hero-copy h1").evaluate(
    (element) => getComputedStyle(element).animationDuration,
  );
  expect(parseFloat(duration)).toBeLessThan(0.1);
});
