import { test, expect } from "./fixture";
import { mkdirSync } from "node:fs";

test("presets, live settings, history and twenty randomized scenes", async ({
  page,
  context,
}) => {
  test.setTimeout(240000);
  mkdirSync("screenshots/phase-4", { recursive: true });
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.setViewportSize({ width: 1000, height: 700 });
  await page.goto("http://localhost:4173");
  await page.waitForTimeout(3000);
  const canvas = page.getByRole("img");
  const renders = await canvas.getAttribute("data-render-count");
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  const arms = page.getByRole("slider", { name: "Spiral arms", exact: true });
  await arms.focus();
  await page.keyboard.press("End");
  await expect(arms).toHaveAttribute("aria-valuenow", "8");
  expect(await canvas.getAttribute("data-render-count")).toBe(renders);
  await page.getByRole("button", { name: "Close settings" }).click();
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await expect(arms).toHaveAttribute("aria-valuenow", "4");
  await page.screenshot({ path: "screenshots/phase-4/settings.png" });
  await page.getByRole("button", { name: "Close settings" }).click();
  await page.addStyleTag({ content: ".intro { display: none !important }" });
  const shots: { title: string; image: string }[] = [];
  for (let i = 0; i < 6; i++) {
    await page.getByLabel("Preset", { exact: true }).selectOption(String(i));
    await page.waitForTimeout(2200);
    const title = await page.getByLabel("Universe name").inputValue();
    const buffer = await page.screenshot({
      path: `screenshots/phase-4/preset-${i}.png`,
    });
    shots.push({ title, image: buffer.toString("base64") });
  }
  const sheet = await context.newPage();
  await sheet.setViewportSize({ width: 1200, height: 930 });
  const contact = async (
    items: typeof shots,
    columns: number,
    path: string,
  ) => {
    await sheet.setContent(
      `<body style="margin:0;background:#080611;color:#eee;font:14px system-ui;display:grid;grid-template-columns:repeat(${columns},1fr);gap:10px">${items.map((item) => `<section><div style="padding:8px">${item.title}</div><img style="width:100%;display:block" src="data:image/png;base64,${item.image}"></section>`).join("")}</body>`,
    );
    await sheet.screenshot({ path, fullPage: true });
  };
  await contact(shots, 2, "screenshots/phase-4/presets.png");
  shots.length = 0;
  await page.getByLabel("Preset", { exact: true }).selectOption("0");
  for (let i = 0; i < 20; i++) {
    await page.getByRole("button", { name: "Randomize", exact: true }).click();
    await page.waitForTimeout(1500);
    const title = await page.getByLabel("Universe name").inputValue();
    const buffer = await page.screenshot({
      path: `screenshots/phase-4/random-${i}.png`,
    });
    shots.push({ title, image: buffer.toString("base64") });
  }
  expect(new Set(shots.map((shot) => shot.title)).size).toBe(20);
  await contact(shots, 4, "screenshots/phase-4/randomized.png");
  await sheet.close();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await page.screenshot({ path: "screenshots/phase-4/mobile-settings.png" });
  expect(errors).toEqual([]);
});
