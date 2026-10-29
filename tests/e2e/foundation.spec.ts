import { test, expect } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
test("ignition, stats, resize and runtime health", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("http://localhost:4173");
  await expect(page.getByRole("img")).toBeVisible();
  await page.waitForTimeout(4000);
  await page.keyboard.press("f");
  await expect(page.locator("output")).toContainText("20,000");
  mkdirSync("screenshots/phase-1", { recursive: true });
  await page.screenshot({ path: "screenshots/phase-1/desktop.png" });
  const frames = await page.evaluate(async () => {
    const samples: number[] = [];
    await new Promise<void>((resolve) => {
      let last = performance.now();
      const tick = (now: number) => {
        samples.push(now - last);
        last = now;
        if (samples.length < 180) requestAnimationFrame(tick);
        else resolve();
      };
      requestAnimationFrame(tick);
    });
    return {
      averageMs: samples.reduce((a, b) => a + b, 0) / samples.length,
      samples: samples.length,
    };
  });
  writeFileSync(
    "screenshots/phase-1/performance.json",
    JSON.stringify(frames, null, 2),
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: "screenshots/phase-1/mobile.png" });
  expect(errors).toEqual([]);
});
