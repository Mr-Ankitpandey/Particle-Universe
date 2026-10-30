import { test, expect } from "./fixture";
import { mkdirSync } from "node:fs";
test("every power, charging, pause, camera and two simultaneous touches", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("http://localhost:4173");
  await page.waitForTimeout(2700);
  mkdirSync("screenshots/phase-2", { recursive: true });
  for (const [key, label] of [
    ["1", "Attract"],
    ["2", "Repel"],
    ["3", "Swirl"],
    ["4", "Shockwave"],
    ["5", "Supernova"],
    ["0", "Pan"],
  ]) {
    if (!key || !label) continue;
    await page.goto("http://localhost:4173");
    await page.waitForTimeout(2700);
    await page.keyboard.press(key);
    await expect(
      page.getByRole("button", { name: label, exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
    await page.mouse.move(800, 450);
    await page.mouse.down();
    await page.mouse.move(850, 420, { steps: 12 });
    await page.waitForTimeout(label === "Supernova" ? 1100 : 180);
    await page.screenshot({
      path: "screenshots/phase-2/" + label.toLowerCase() + ".png",
    });
    await page.mouse.up();
  }
  await page.keyboard.press("Space");
  await page.keyboard.press("f");
  await expect(page.locator("output")).toContainText("PAUSED");
  await page.keyboard.press(".");
  await page.mouse.wheel(0, -300);
  await page.keyboard.press("Backspace");
  await page.keyboard.press("Space");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.keyboard.press("1");
  const session = await page.context().newCDPSession(page);
  await session.send("Emulation.setTouchEmulationEnabled", {
    enabled: true,
    maxTouchPoints: 5,
  });
  await session.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [
      { x: 150, y: 400, id: 1 },
      { x: 240, y: 440, id: 2 },
    ],
  });
  await session.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [
      { x: 100, y: 380, id: 1 },
      { x: 290, y: 460, id: 2 },
    ],
  });
  await page.waitForTimeout(200);
  await page.screenshot({ path: "screenshots/phase-2/multitouch.png" });
  await session.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  expect(errors).toEqual([]);
});
