import fs from "node:fs";

// Ensures both .output/public and dist exist for any hosting platform (Netlify, Cloudflare, static hosts)
if (fs.existsSync(".output/public")) {
  fs.mkdirSync("dist", { recursive: true });
  fs.cpSync(".output/public", "dist", { recursive: true });
  console.log("Successfully synchronized build output to dist/ for hosting compatibility.");
}
