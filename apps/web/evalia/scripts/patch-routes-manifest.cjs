#!/usr/bin/env node
/**
 * Ensures .next/routes-manifest.json contains dataRoutes array (workaround for runtime expecting iterable).
 */
const fs = require("fs");
const path = require("path");
const manifestPath = path.join(
  __dirname,
  "..",
  ".next",
  "routes-manifest.json"
);
if (!fs.existsSync(manifestPath)) {
  console.error("[patch-routes-manifest] manifest not found:", manifestPath);
  process.exit(0);
}
try {
  const raw = fs.readFileSync(manifestPath, "utf-8");
  const json = JSON.parse(raw);
  if (!Array.isArray(json.dataRoutes)) {
    json.dataRoutes = [];
    fs.writeFileSync(manifestPath, JSON.stringify(json));
    console.log("[patch-routes-manifest] injected empty dataRoutes array");
  } else {
    console.log("[patch-routes-manifest] dataRoutes already present");
  }
} catch (e) {
  console.error("[patch-routes-manifest] failed:", e);
}
