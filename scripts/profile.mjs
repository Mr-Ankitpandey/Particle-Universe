import { chromium } from "@playwright/test";
import fs from "node:fs";
const browser = await chromium.launch({ headless: true, channel: "msedge" });
const session = await browser.newBrowserCDPSession();
const info = await session.send("SystemInfo.getInfo");
fs.writeFileSync(
  "screenshots/phase-1/gpu-edge.json",
  JSON.stringify(
    { devices: info.gpu.devices, featureStatus: info.gpu.featureStatus },
    null,
    2,
  ),
);
const page = await browser.newPage();
await page.goto("http://localhost:4173");
await page.waitForTimeout(3000);
const cdp = await page.context().newCDPSession(page);
await cdp.send("HeapProfiler.enable");
await cdp.send("HeapProfiler.startSampling", { samplingInterval: 1024 });
await cdp.send("Profiler.enable");
await cdp.send("Profiler.start");
await page.waitForTimeout(5000);
const cpu = await cdp.send("Profiler.stop");
const heap = await cdp.send("HeapProfiler.stopSampling");
fs.writeFileSync(
  "screenshots/phase-1/cpu-profile.json",
  JSON.stringify(cpu.profile),
);
fs.writeFileSync(
  "screenshots/phase-1/allocation-sampling.json",
  JSON.stringify(heap.profile),
);
await browser.close();
