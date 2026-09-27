import { expect, test } from "@playwright/test";

test("opening highlights keep the hero fixed at recording size", async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto("/demo");
  await expect(page.locator('[data-demo="mission"]')).toBeHidden();
  await expect(page.locator('[data-demo="proof-transition"]')).toBeHidden();
  await expect(page.locator('[data-demo="problem"]')).toBeHidden();
  await page.clock.install();
  await page.getByRole("button", { name: "Start demo" }).click();
  await expect(page.locator(".video-demo-controls")).toHaveCount(0);
  await page.clock.runFor(3000);
  await page.keyboard.press("k");
  await expect(page.locator(".video-demo-controls")).toBeVisible();
  await expect(page.locator('[data-demo="current-step"]')).toHaveText("Introductions");
  await page.keyboard.press("k");
  await expect(page.locator(".video-demo-controls")).toHaveCount(0);
  await expect(page.locator('[data-demo="hero-headline"]')).not.toHaveClass(/video-demo-target/);
  const ledger = page.locator('[data-demo="hero-ledger"]');
  const layout = () => ledger.evaluate((element) => {
    const visual = element as HTMLElement;
    return {
      x: visual.offsetLeft,
      y: visual.offsetTop,
      position: getComputedStyle(visual).position,
    };
  });
  const initial = await layout();
  expect(initial.position).toBe("absolute");
  await page.screenshot({ path: "test-results/video-demo-opening-03.png" });

  for (const advance of [6000, 7000, 6000]) {
    await page.clock.fastForward(advance);
    const current = await layout();
    expect(current.position).toBe("absolute");
    expect(current.x).toBe(initial.x);
    expect(current.y).toBe(initial.y);
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
  }
  await page.screenshot({ path: "test-results/video-demo-opening-22.png" });
  await page.clock.fastForward(4000);
  await page.clock.runFor(7000);
  await expect(page.locator('[data-demo="canada"]')).toBeInViewport();
  await page.screenshot({ path: "test-results/video-demo-opening-canada.png" });
  await page.goto("/about");
  await expect(page.locator('[data-demo="mission"]')).toBeVisible();
});

test("the full recording follows the fixed timeline from a fresh desktop session", async ({ page }) => {
  const errors: string[] = [];
  const coachCalls: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("request", (request) => {
    if (request.url().includes("/api/bid-coach")) coachCalls.push(request.url());
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/demo");
  await expect(page.locator('[data-demo="about-hero"]')).toBeVisible();
  await expect(page.getByRole("button", { name: "Start demo" })).toBeVisible();
  await page.screenshot({ path: "test-results/video-demo-idle.png" });
  await page.clock.install();
  await page.getByRole("button", { name: "Start demo" }).click();
  await expect(page.locator(".video-demo-controls")).toHaveCount(0);

  await page.clock.fastForward(22000);
  await expect(page).toHaveURL(/\/demo$/);
  await expect(page.locator('[data-demo="hero-requirement-projects"]')).toHaveClass(/video-demo-target/);
  await page.clock.fastForward(8000);
  await expect(page.locator('[data-demo="canada"]')).toHaveClass(/video-demo-target/);
  await page.clock.fastForward(10000);
  await expect(page.locator('[data-demo="canada-contracts"]')).toHaveClass(/video-demo-target/);
  await expect(page.locator('[data-demo="canada-contracts"] strong')).toHaveText("$66.9B");
  await expect(page.locator('[data-demo="canada-smes"] strong')).toHaveText("63.6%");
  await page.screenshot({ path: "test-results/video-demo-canada.png" });
  await page.clock.fastForward(14000);
  await expect(page.locator('[data-demo="canada-smes"]')).toHaveClass(/video-demo-target/);
  await page.clock.fastForward(12000);
  await expect(page.locator('[data-demo="discovery-title"]')).toHaveClass(/video-demo-target/);
  await page.clock.fastForward(17000);
  await expect(page.locator('[data-demo="product-window"]')).toHaveClass(/video-demo-target/);
  await page.clock.runFor(2000);
  await page.screenshot({ path: "test-results/video-demo-product-preview.png" });
  await page.clock.fastForward(3000);
  await expect(page.locator('[data-demo="product-cta"]')).toHaveText(/See a sample readiness check/);
  await page.clock.fastForward(6000);
  await expect(page).toHaveURL(/\/opportunities\/energy-retrofit\?sample=1&demo=video/);
  await page.clock.fastForward(8000);
  await expect(page.locator('[data-demo="decision"]')).toHaveText("Fix gaps before committing proposal resources");
  await expect(page.locator('[data-demo="score"]')).toContainText("83%");
  await expect(page.locator('[data-demo="tender-title"]')).toBeInViewport();
  await expect(page.locator('[data-demo="decision"]')).toBeInViewport();
  await expect(page.locator('[data-demo="score"]')).toBeInViewport();
  await page.screenshot({ path: "test-results/video-demo-outcome.png" });
  await page.clock.fastForward(31000);
  await expect(page.locator('[data-demo="requirement-projects"]')).toHaveAttribute("open", "");
  await page.clock.fastForward(20000);
  await expect(page.locator('[data-demo="requirement-security"]')).toHaveAttribute("open", "");
  await page.clock.fastForward(22000);
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.locator('[data-demo="plan-blocked"]')).toContainText("before starting response work");
  await expect(page.locator('[data-demo="plan-phase-1"]')).not.toBeVisible();
  await page.clock.runFor(1000);
  await page.screenshot({ path: "test-results/video-demo-plan.png" });
  await page.clock.fastForward(19000);
  await expect(page.locator('[data-demo="plan-phase-4"]')).toBeVisible();
  await expect(page.locator('[data-demo="plan-phase-4"]')).toBeInViewport();
  await expect(page.locator('[data-demo="plan-phase-4"] input')).toBeDisabled();
  await page.clock.fastForward(9000);
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(page.locator('[data-demo="coach"]')).toBeVisible();
  await page.clock.fastForward(20000);
  await expect(page).toHaveURL(/\/about\?demo=video/);
  await page.clock.fastForward(9000);
  await expect(page.locator('[data-demo="roadmap-validation"]')).toHaveClass(/video-demo-target/);
  await page.screenshot({ path: "test-results/video-demo-roadmap.png" });
  await page.clock.fastForward(13000);
  await page.clock.runFor(1000);
  await expect(page.locator('[data-demo="roadmap-pilots"]')).toHaveClass(/video-demo-target/);
  await page.clock.fastForward(11000);
  await expect(page.locator('[data-demo="roadmap-statement"]')).toHaveClass(/video-demo-target/);
  await expect(page.locator('[data-demo="roadmap-north-star"]')).not.toHaveClass(/video-demo-target/);
  await page.clock.fastForward(9000);
  await expect(page.locator('[data-demo="closing-frame"]')).toBeVisible();
  await expect(page.locator('[data-demo="closing-frame"]')).toContainText("Bid smarter. Start stronger.");
  await page.clock.runFor(1000);
  await page.screenshot({ path: "test-results/video-demo-closing.png" });
  await page.clock.fastForward(2000);
  await expect(page.locator(".video-demo-controls")).toHaveCount(0);
  expect(coachCalls).toEqual([]);
  expect(errors).toEqual([]);
});

test("jumping to a time rebuilds the correct scene in both directions", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/demo");
  await page.clock.install();
  const jump = async (time: string) => {
    if (await page.locator(".video-demo-controls").count() === 0) await page.keyboard.press("k");
    await page.getByRole("textbox", { name: "Jump to time" }).fill(time);
    await page.getByRole("button", { name: "Jump", exact: true }).click();
    await expect(page.locator(".video-demo-controls")).toHaveCount(0);
  };

  await jump("2:57");
  await expect(page).toHaveURL(/\/opportunities\/energy-retrofit\?sample=1&demo=video/);
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.locator('[data-demo="plan-phase-0"]')).toBeVisible();
  await expect(page.locator('[data-demo="plan-phase-1"]')).not.toBeVisible();
  await page.keyboard.press("k");
  await expect(page.locator('[aria-label="Elapsed time"]')).toContainText("2:57 / 4:30");

  await jump("2:21");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(page.locator('[data-demo="requirement-projects"]')).toHaveAttribute("open", "");
  await expect(page.locator('[data-demo="source-projects"]')).toBeInViewport();

  await jump("205");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(page.locator('[data-demo="coach"]')).toBeVisible();
  await page.keyboard.press("k");
  await expect(page.locator('[data-demo="current-step"]')).toHaveText("Profile-based Readiness Coach");

  await jump("0:03");
  await expect(page).toHaveURL(/\/demo$/);
  await page.keyboard.press("k");
  await expect(page.locator('[data-demo="current-step"]')).toHaveText("Introductions");
  await page.keyboard.press("k");
  await expect(page.locator('[data-demo="hero-headline"]')).not.toHaveClass(/video-demo-target/);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  await page.clock.fastForward(3000);
  await expect(page.locator('[data-demo="hero-headline"]')).toHaveClass(/video-demo-target/);

  await jump("4:06");
  await expect(page).toHaveURL(/\/about\?demo=video/);
  await expect(page.locator('[data-demo="roadmap-pilots"]')).toHaveClass(/video-demo-target/);
  await jump("4:17");
  await expect(page.locator('[data-demo="roadmap-statement"]')).toHaveClass(/video-demo-target/);
  await expect(page.locator('[data-demo="roadmap-statement"]')).toBeInViewport();
  await expect(page.locator('[data-demo="roadmap-north-star"]')).not.toHaveClass(/video-demo-target/);
  await jump("4:25");
  await expect(page.locator('[data-demo="closing-frame"]')).toHaveCount(0);
  await expect(page.locator('[data-demo="roadmap-statement"]')).toHaveClass(/video-demo-target/);
  await page.screenshot({ path: "test-results/video-demo-roadmap-statement.png" });
  await jump("4:26");
  await expect(page.locator('[data-demo="closing-frame"]')).toBeVisible();
  await page.keyboard.press("k");
  await expect(page.locator(".video-demo-controls")).toBeVisible();
  await page.keyboard.press("k");
  await expect(page.locator(".video-demo-controls")).toHaveCount(0);
  await page.keyboard.press("r");
  await expect(page).toHaveURL(/\/demo$/);
  await expect(page.locator('[data-demo="closing-frame"]')).toHaveCount(0);
});
