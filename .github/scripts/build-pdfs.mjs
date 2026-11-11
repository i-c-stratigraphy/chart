#!/usr/bin/env node

import fs from "node:fs/promises";
import { constants } from "node:fs";
import http from "node:http";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { Parser, Store, DataFactory } from "n3";
import { exportPdf } from "./export-pdf.mjs";

const root = fileURLToPath(new URL("../../", import.meta.url));
const { namedNode } = DataFactory;

function parseArgs(argv) {
  const options = {};
  const allowed = new Set(["languages", "build-dir", "output-dir", "chrome-path", "timeout-ms"]);
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--help") {
      console.log("Build chart PDFs using the same exporter as GitHub Actions.\n" +
        "Options: --languages en,pt-pt --output-dir output/pdf --chrome-path PATH\n" +
        "         --build-dir PATH (use an existing build) --timeout-ms 180000\n" +
        "By default, build chart-ui and export Main plus every RDF language.");
      return null;
    }
    const key = argv[i].replace(/^--/, "");
    if (!argv[i].startsWith("--") || !allowed.has(key) || !argv[i + 1] || argv[i + 1].startsWith("--")) {
      throw new Error(`Invalid argument: ${argv[i]}. Use --help for options.`);
    }
    options[key] = argv[++i];
  }
  return options;
}

async function findChrome(requested) {
  const candidates = requested ? [requested] : [
    process.env.CHROME_PATH,
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    process.env.PROGRAMFILES && path.join(process.env.PROGRAMFILES, "Google/Chrome/Application/chrome.exe"),
  ].filter(Boolean);
  for (const candidate of candidates) {
    try {
      await fs.access(candidate, constants.X_OK);
      return candidate;
    } catch {}
  }
  throw new Error("Chrome not found. Set CHROME_PATH or pass --chrome-path /path/to/chrome.");
}

async function run(command, args, cwd) {
  await new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: "inherit",
      env: { ...process.env, NUXT_APP_BASE_URL: "/chart/" },
    });
    child.on("error", reject);
    child.on("exit", (code, signal) => code === 0 ? resolve() : reject(new Error(`Build failed: ${signal || code}`)));
  });
}

const contentTypes = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".json": "application/json", ".png": "image/png",
  ".gif": "image/gif", ".svg": "image/svg+xml", ".ico": "image/x-icon",
  ".jpg": "image/jpeg", ".woff": "font/woff", ".woff2": "font/woff2",
};

async function serve(buildDir) {
  const server = http.createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
      const file = path.resolve(buildDir, pathname.slice("/chart/".length) || "index.html");
      if (!pathname.startsWith("/chart/") || !file.startsWith(buildDir + path.sep)) {
        response.writeHead(404).end();
        return;
      }
      const bytes = await fs.readFile(file);
      response.writeHead(200, { "Content-Type": contentTypes[path.extname(file)] || "application/octet-stream" });
      response.end(bytes);
    } catch {
      response.writeHead(404).end();
    }
  });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  return server;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (!options) return;
  const chromePath = await findChrome(options["chrome-path"]);
  const timeoutMs = Number(options["timeout-ms"] || 180000);
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) throw new Error("Invalid timeout-ms");
  const store = new Store(new Parser().parse(await fs.readFile(path.join(root, "chart.ttl"), "utf8")));
  const scheme = namedNode("https://data.stratigraphy.org/def/chart");
  const version = store.getObjects(scheme, namedNode("http://www.w3.org/2002/07/owl#versionInfo"), null)[0]?.value;
  if (!version || !/^[A-Za-z0-9._-]+$/.test(version)) throw new Error("Missing or invalid chart version");
  const available = [...new Set(store.getObjects(null, namedNode("http://www.w3.org/2004/02/skos/core#prefLabel"), null)
    .map(term => term.language).filter(Boolean))].sort();
  const languages = options.languages ? [...new Set(options.languages.split(","))] : available;
  for (const language of languages) {
    if (!available.includes(language)) throw new Error(`Unknown chart language: ${language}`);
  }
  const ui = path.join(root, "chart-ui");
  const buildDir = path.resolve(root, options["build-dir"] || "chart-ui/.output/public");
  const outputDir = path.resolve(root, options["output-dir"] || "output/pdf");
  if (!options["build-dir"]) {
    await run(process.execPath, ["scripts/check-chart-data.mjs"], ui);
    await run(process.execPath, ["node_modules/nuxt/bin/nuxt.mjs", "generate"], ui);
  }
  await fs.access(path.join(buildDir, "index.html"));
  await fs.mkdir(outputDir, { recursive: true });
  const server = await serve(buildDir);
  try {
    const base = `http://127.0.0.1:${server.address().port}/chart/`;
    for (const language of ["", ...languages]) {
      const output = path.join(outputDir, `ICS_Chart_${version}${language ? `_${language}` : ""}.pdf`);
      const url = new URL(base);
      url.searchParams.set("scale", "print");
      if (language) url.searchParams.set("language", language);
      await fs.rm(output, { force: true });
      await exportPdf({ chromePath, url: url.href, output, timeoutMs });
    }
    console.log(`Generated ${languages.length + 1} PDFs in ${outputDir}`);
  } finally {
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
  }
}

main().catch(error => {
  console.error(`[build-pdfs] ${error.stack || error}`);
  process.exitCode = 1;
});
