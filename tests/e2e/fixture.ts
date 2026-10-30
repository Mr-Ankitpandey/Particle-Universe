import { test as base, expect, type BrowserContext } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";

// The optional static transport keeps browser QA available on hosts that block
// loopback sockets. Normal runs still exercise the Vite preview server.
export async function staticPreview(context: BrowserContext) {
  if (!process.env.STATIC_PREVIEW) return;
  const root = resolve("dist");
  await context.route("http://localhost:4173/**", async (route) => {
    const path = resolve(
      root,
      "." +
        decodeURIComponent(
          new URL(route.request().url()).pathname === "/"
            ? "/index.html"
            : new URL(route.request().url()).pathname,
        ),
    );
    if (!path.startsWith(root + sep)) return route.abort();
    const mime: Record<string, string> = {
      ".html": "text/html",
      ".js": "application/javascript",
      ".css": "text/css",
      ".woff2": "font/woff2",
      ".woff": "font/woff",
      ".svg": "image/svg+xml",
    };
    try {
      await route.fulfill({
        body: await readFile(path),
        contentType: mime[extname(path)] ?? "application/octet-stream",
      });
    } catch {
      await route.fulfill({ status: 404, body: "Not found" });
    }
  });
}
export const test = base.extend<{ staticTransport: void }>({
  staticTransport: [
    async ({ context }, use) => {
      await staticPreview(context);
      await use();
    },
    { auto: true },
  ],
});
export { expect };
