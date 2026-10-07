import { cp, mkdir, rm } from "node:fs/promises";

const files = ["index.html", "styles.css", "app.js", "calc.js"];
await rm("dist", { recursive: true, force: true });
await mkdir("dist/vendor", { recursive: true });
for (const file of files) await cp(file, `dist/${file}`);
await cp("vendor/xlsx.full.min.js", "dist/vendor/xlsx.full.min.js");
console.log("Built static site in dist/");
