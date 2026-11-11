#!/usr/bin/env node

import fs from "node:fs/promises";
import process from "node:process";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright-core";
import { PDFDocument } from "pdf-lib";

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

export async function exportPdf({ chromePath, url, output, timeoutMs = 180000 }) {
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
      null,
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

    await page.emulateMedia({ media: "print" });
    await page.waitForFunction(
      () => document.fonts.status === "loaded" && Array.from(document.images).every(image => image.complete),
      null,
      { timeout: timeoutMs }
    );
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all(Array.from(document.images, (image) => image.decode().catch(() => {})));
      for (const image of document.querySelectorAll(".grid-5.only-print img, .ccgm-logo")) {
        if (!image.naturalWidth) throw new Error(`Print logo failed to load: ${image.src}`);
      }
    });

    const pdfOptions = {
      printBackground: true,
      displayHeaderFooter: false,
      preferCSSPageSize: true,
    };
    let pdf = await page.pdf(pdfOptions);
    let pageCount = (await PDFDocument.load(pdf)).getPageCount();
    while (pageCount > 1) {
      const moved = await page.evaluate(() => {
        const destination = document.querySelector(".overflow-notes");
        const notes = document.querySelectorAll(".chart-notes .publication-note");
        if (!destination || !notes.length) return 0;
        const charts = Array.from(document.querySelectorAll(".grid-7, .precambrian-grid"));
        const before = charts.map(chart => chart.getBoundingClientRect().toJSON());
        destination.prepend(notes[notes.length - 1]);
        for (const [index, chart] of charts.entries()) {
          const after = chart.getBoundingClientRect();
          for (const dimension of ["x", "y", "width", "height"]) {
            if (Math.abs(before[index][dimension] - after[dimension]) > 0.1) {
              throw new Error("Reflowing notes changed the chart geometry");
            }
          }
        }
        return 1;
      });
      if (moved) {
        console.log(`[export-pdf] Reflowed ${moved} publication notes into the lower margin`);
        pdf = await page.pdf(pdfOptions);
        pageCount = (await PDFDocument.load(pdf)).getPageCount();
      } else {
        break;
      }
    }
    if (pageCount !== 1) {
      throw new Error(`Chart must fit on one page; got ${pageCount} pages for ${url}. No PDF was saved.`);
    }
    await fs.writeFile(output, pdf);

    const stats = await fs.stat(output);
    if (stats.size <= 0) {
      throw new Error(`Generated empty PDF: ${output}`);
    }

    console.log(
      `[export-pdf] chartReady=${chartReadyState} pages=${pageCount} output=${output} size=${stats.size}`
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

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    const message = error instanceof Error ? error.stack || error.message : error;
    console.error(`[export-pdf] ERROR ${message}`);
    process.exitCode = 1;
  });
}
