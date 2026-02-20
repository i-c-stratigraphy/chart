#!/usr/bin/env node

import fs from "node:fs/promises";
import process from "node:process";
import { chromium } from "playwright-core";

function parseArgs(argv) {
  const parsed = {};
  for (let i = 0; i < argv.length; i += 1) {
    const current = argv[i];
    if (!current.startsWith("--")) {
      continue;
    }
    const key = current.slice(2);
    const value = argv[i + 1];
    if (!value || value.startsWith("--")) {
      throw new Error(`Missing value for --${key}`);
    }
    parsed[key] = value;
    i += 1;
  }
  return parsed;
}

function getConfig() {
  const args = parseArgs(process.argv.slice(2));
  const chromePath = args["chrome-path"];
  const url = args.url;
  const output = args.output;
  const timeoutMs = Number(args["timeout-ms"] ?? "180000");

  if (!chromePath) {
    throw new Error("Missing required argument: --chrome-path");
  }
  if (!url) {
    throw new Error("Missing required argument: --url");
  }
  if (!output) {
    throw new Error("Missing required argument: --output");
  }
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    throw new Error("Invalid --timeout-ms value");
  }

  return { chromePath, url, output, timeoutMs };
}

async function exportPdf({ chromePath, url, output, timeoutMs }) {
  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
  });

  try {
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
    });
    const page = await context.newPage();

    await page.goto(url, { waitUntil: "domcontentloaded", timeout: timeoutMs });

    await page.waitForFunction(
      () => {
        const state = document.documentElement.dataset.chartReady;
        return state === "1" || state === "error";
      },
      { timeout: timeoutMs }
    );

    const chartReadyState = await page.evaluate(
      () => document.documentElement.dataset.chartReady ?? ""
    );
    if (chartReadyState !== "1") {
      throw new Error(`Chart did not become ready. chartReady=${chartReadyState}`);
    }

    await page.waitForSelector(".grid-wrapper", {
      state: "attached",
      timeout: Math.min(timeoutMs, 30000),
    });

    await page.pdf({
      path: output,
      printBackground: true,
      displayHeaderFooter: false,
      preferCSSPageSize: true,
    });

    const stats = await fs.stat(output);
    if (stats.size <= 0) {
      throw new Error(`Generated empty PDF: ${output}`);
    }

    console.log(
      `[export-pdf] chartReady=${chartReadyState} output=${output} size=${stats.size}`
    );

    await context.close();
  } finally {
    await browser.close();
  }
}

async function main() {
  const config = getConfig();
  await exportPdf(config);
}

main().catch((error) => {
  const message = error instanceof Error ? error.stack || error.message : error;
  console.error(`[export-pdf] ERROR ${message}`);
  process.exit(1);
});
