// Rasterize the brand SVG to a 1024px PNG for `pnpm tauri icon`.
// Usage: node scripts/rasterize-logo.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { Resvg } from "@resvg/resvg-js";

const svg = readFileSync("assets/logo.svg", "utf8");
const resvg = new Resvg(svg, { fitTo: { mode: "width", value: 1024 } });
const png = resvg.render().asPng();
writeFileSync("assets/logo-1024.png", png);
console.log("wrote assets/logo-1024.png");
