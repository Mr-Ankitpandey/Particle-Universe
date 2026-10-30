import { test, expect, staticPreview } from "./fixture";
import { mkdirSync, writeFileSync } from "node:fs";

test("full-resolution stars under low-end CPU load and HiDPI", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 2,
  });
  await staticPreview(context);
  const page = await context.newPage();
  await page.goto("http://localhost:4173");
  await page.waitForTimeout(3000);
  const dimensions = await page.getByRole("img").evaluate((canvas) => ({
    width: (canvas as HTMLCanvasElement).width,
    height: (canvas as HTMLCanvasElement).height,
  }));
  expect(dimensions).toEqual({ width: 2560, height: 1440 });
  mkdirSync("screenshots/phase-3/optimized", { recursive: true });
  await page.screenshot({ path: "screenshots/phase-3/optimized/hidpi.png" });
  const session = await context.newCDPSession(page);
  await session.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  const timing = await page.evaluate(async () => {
    const samples: number[] = [];
    await new Promise<void>((resolve) => {
      let previous = performance.now();
      const tick = (now: number) => {
        samples.push(now - previous);
        previous = now;
        if (samples.length < 90) requestAnimationFrame(tick);
        else resolve();
      };
      requestAnimationFrame(tick);
    });
    return {
      frameMs: samples.reduce((a, b) => a + b, 0) / samples.length,
      frames: samples.length,
    };
  });
  await page.keyboard.press("f");
  await expect(page.locator("output")).toContainText("20,000");
  writeFileSync(
    "screenshots/phase-3/optimized/throttled.json",
    JSON.stringify(
      { cpuThrottle: 4, dpr: 2, width: 1280, height: 720, ...timing },
      null,
      2,
    ),
  );
  await session.send("Emulation.setCPUThrottlingRate", { rate: 1 });
  await context.close();
});
