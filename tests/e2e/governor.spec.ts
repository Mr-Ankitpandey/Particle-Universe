import { test, expect } from "./fixture";
import { mkdirSync, writeFileSync } from "node:fs";

test("adaptive quality fades down under CPU throttle and recovers", async ({
  page,
  context,
}) => {
  test.setTimeout(120000);
  await page.setViewportSize({ width: 800, height: 600 });
  await page.goto("http://localhost:4173");
  await page.keyboard.press("f");
  const stats = page.locator(".stats");
  const count = async () => {
    const text = (await stats.textContent()) ?? "";
    return Number(text.split(" · ")[2]?.split(" / ")[0]?.replaceAll(",", ""));
  };
  const cdp = await context.newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await page.waitForTimeout(24000);
  const reduced = await count();
  const throttled = await stats.textContent();
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 1 });
  await page.waitForTimeout(40000);
  const recovered = await count();
  mkdirSync("screenshots/phase-4", { recursive: true });
  writeFileSync(
    "screenshots/phase-4/governor.json",
    JSON.stringify(
      { reduced, recovered, throttled, final: await stats.textContent() },
      null,
      2,
    ),
  );
  expect(reduced).toBeLessThan(20000);
  expect(recovered).toBeGreaterThan(reduced);
});
