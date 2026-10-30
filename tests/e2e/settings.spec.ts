import { test, expect } from "./fixture";

test("all numeric settings update without rerendering the canvas", async ({
  page,
}) => {
  await page.goto("http://localhost:4173");
  const canvas = page.getByRole("img");
  const renders = await canvas.getAttribute("data-render-count");
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  for (const tab of ["Galaxy", "Physics", "Appearance", "Simulation"]) {
    await page.getByRole("tab", { name: tab, exact: true }).click();
    const sliders = page.getByRole("slider");
    for (let i = 0; i < (await sliders.count()); i++) {
      const slider = sliders.nth(i);
      const previous = await slider.getAttribute("aria-valuenow");
      await slider.focus();
      await page.keyboard.press("ArrowRight");
      await expect(slider).not.toHaveAttribute("aria-valuenow", previous ?? "");
      expect(await canvas.getAttribute("data-render-count")).toBe(renders);
    }
  }
});
