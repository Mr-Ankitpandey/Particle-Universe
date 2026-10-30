import { test, expect } from "./fixture";
import { mkdirSync } from "node:fs";
test("objects, black-hole rendering, limits, bloom and flow", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("http://localhost:4173");
  await page.waitForTimeout(2700);
  mkdirSync("screenshots/phase-3", { recursive: true });
  await page.keyboard.press("7");
  await page.mouse.click(720, 468);
  await page.waitForTimeout(1300);
  await page.screenshot({ path: "screenshots/phase-3/black-hole.png" });
  await page.mouse.move(720, 468);
  await page.mouse.down();
  await page.mouse.move(800, 480, { steps: 10 });
  await page.mouse.up();
  await page.mouse.wheel(0, -120);
  await page.screenshot({ path: "screenshots/phase-3/drag-resize.png" });
  await page.mouse.click(800, 480, { button: "right" });
  await expect(page.getByRole("status")).toContainText("removed");
  await page.keyboard.press("6");
  for (let i = 0; i < 12; i++)
    await page.mouse.click(420 + (i % 4) * 130, 300 + Math.floor(i / 4) * 120);
  await page.mouse.click(1000, 650);
  await expect(page.getByRole("status")).toContainText("12 cosmic objects");
  await page.screenshot({ path: "screenshots/phase-3/entity-limit.png" });
  await page.goto("http://localhost:4173");
  await page.waitForTimeout(2700);
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await page.getByRole("tab", { name: "Physics", exact: true }).click();
  await page.getByLabel("Curl-noise flow").check();
  await page.getByRole("tab", { name: "Appearance", exact: true }).click();
  await page.getByLabel("Trail style").selectOption("streak");
  await page.waitForTimeout(3000);
  await page.screenshot({ path: "screenshots/phase-3/flow.png" });
  await page.getByLabel("Bloom", { exact: true }).focus();
  await page.keyboard.press("Home");
  await page.waitForTimeout(300);
  await page.screenshot({ path: "screenshots/phase-3/bloom-off.png" });
  await page.getByLabel("Bloom", { exact: true }).focus();
  await page.keyboard.press("End");
  await page.waitForTimeout(300);
  await page.screenshot({ path: "screenshots/phase-3/bloom-on.png" });
  expect(errors).toEqual([]);
});
test("mobile object dragging and long-press removal", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("http://localhost:4173");
  await page.getByRole("button", { name: "Vortex", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Vortex", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Emulation.setTouchEmulationEnabled", {
    enabled: true,
    maxTouchPoints: 5,
  });
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x: 195, y: 430, id: 1 }],
  });
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x: 195, y: 430, id: 1 }],
  });
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [{ x: 240, y: 490, id: 1 }],
  });
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x: 240, y: 490, id: 1 }],
  });
  await page.waitForTimeout(750);
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await expect(page.getByRole("status")).toContainText("removed");
  await page.screenshot({ path: "screenshots/phase-3/mobile.png" });
});
