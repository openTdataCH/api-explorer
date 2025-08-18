import fs from "fs";
import fse from "fs-extra";
import path from "path";
import dotenv from "dotenv";
import { parse as parseYaml } from "yaml";

const configPath = "apis.yaml";

// Helper: resolve ${VAR}
function resolveVar(apiCfg, placeholder) {
  const apiId = apiCfg.id;

  const mapSecrets = apiCfg['map_secrets'] ?? {};
  const secretKey = mapSecrets[placeholder] ?? null;
  if (secretKey === null) {
    throw new Error(`Error API ${apiId}: missing placeholder ${placeholder} in config`);
  }

  const value = merged[secretKey] ?? null;
  if (value === null) {
    throw new Error(`Error API ${apiId}: missing secret defined for key ${secretKey}`);
  }

  return value;
}

// Do ${VAR} substitutions in the YAML
function substitute(apiCfg, text) {
  return text.replace(/\$\{([A-Z0-9_]+)\}/g, (_, name) => String(resolveVar(apiCfg, name)));
}

// 1) Load .env then .env.local (override)
const envOrder = [".env", ".env.local"];
const merged = {};
for (const file of envOrder) {
  if (fs.existsSync(file)) {
    const parsed = dotenv.parse(fs.readFileSync(file));
    Object.assign(merged, parsed); // later files override earlier ones
  }
}
// also allow real environment to override (useful in CI)
for (const [k, v] of Object.entries(process.env)) {
  if (k && v != null) merged[k] = v;
}

/* Read config */
if (!fs.existsSync(configPath)) {
  console.error(`Config not found: ${configPath}`);
  process.exit(1);
}
const cfg = parseYaml(fs.readFileSync(configPath, "utf8"));
const apis = cfg.apis ?? [];

const navLinks = [];

/* Build all APIs */
for (const apiConfig of apis) {
  const apiId = apiConfig.id;
  if (!apiId) throw new Error("Every api entry needs an 'id'");

  const srcYml = path.join("openapi", apiId, "openapi.template.yaml");
  const outDir = path.join("dist", apiId);
  const outYml = path.join(outDir, "openapi.yaml");
  const srcHtml = path.join("site", "swagger.html");
  const outHtml = path.join(outDir, "index.html");

  await fse.ensureDir(outDir);

  if (!fs.existsSync(srcYml)) throw new Error(`Template not found: ${srcYml}`);
  const srcYmlText = await fse.readFile(srcYml, "utf8");
  await fse.writeFile(outYml, substitute(apiConfig, srcYmlText), "utf8");

  // Write HTML
  if (!fs.existsSync(srcHtml)) throw new Error(`Swagger HTML not found: ${srcHtml}`);
  const outHtmlText = await fse.readFile(srcHtml, "utf8");
  await fse.writeFile(outHtml, substitute(apiConfig, outHtmlText), "utf8");

  console.log(`Built ${apiId} → ${outYml} + ${outHtml}`);

  const navLinkTitle = apiConfig.title;
  const navLink = '<a href="./' + apiId + '/">' + navLinkTitle + '</a>';
  navLinks.push(navLink);
}

// Replace landing, root page
const landingSrc = "site/index.html";
const landingDst = "dist/index.html";

let landingText = fs.readFileSync(landingSrc, "utf8");
landingText = landingText.replace('[APIS_LIST]', navLinks.join("\n"));

const dateF = new Date().toISOString();
landingText = landingText.replace('[LAST_UPDATE]', dateF);

fs.writeFileSync(landingDst, landingText, "utf8");

console.log(`Saved landing page to + ${landingDst}`);
