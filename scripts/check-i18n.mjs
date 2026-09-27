import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

export function flattenKeys(obj, prefix = "") {
  let result = {};
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(result, flattenKeys(value, fullKey));
    } else {
      result[fullKey] = String(value);
    }
  }
  return result;
}

export function checkIcuSyntax(str) {
  // Check balanced curly braces
  let depth = 0;
  for (let i = 0; i < str.length; i++) {
    if (str[i] === "{") depth++;
    if (str[i] === "}") depth--;
    if (depth < 0) return "Unbalanced closing curly brace";
  }
  if (depth !== 0) return "Unclosed opening curly brace";
  return null;
}

export function validateFilePair(enPath, tePath, label) {
  const errors = [];
  if (!fs.existsSync(enPath)) {
    errors.push(`Missing English message file: ${enPath}`);
    return errors;
  }
  if (!fs.existsSync(tePath)) {
    errors.push(`Missing Telugu message file: ${tePath}`);
    return errors;
  }

  const enRaw = fs.readFileSync(enPath, "utf8");
  const teRaw = fs.readFileSync(tePath, "utf8");

  let enJson, teJson;
  try {
    enJson = JSON.parse(enRaw);
  } catch (err) {
    errors.push(`JSON parse error in ${enPath}: ${err.message}`);
  }
  try {
    teJson = JSON.parse(teRaw);
  } catch (err) {
    errors.push(`JSON parse error in ${tePath}: ${err.message}`);
  }

  if (!enJson || !teJson) return errors;

  const enFlat = flattenKeys(enJson);
  const teFlat = flattenKeys(teJson);

  const enKeys = new Set(Object.keys(enFlat));
  const teKeys = new Set(Object.keys(teFlat));

  // Check missing keys in Telugu
  for (const key of enKeys) {
    if (!teKeys.has(key)) {
      errors.push(`[${label}] Key "${key}" exists in English but missing in Telugu`);
    }
  }

  // Check missing keys in English
  for (const key of teKeys) {
    if (!enKeys.has(key)) {
      errors.push(`[${label}] Key "${key}" exists in Telugu but missing in English`);
    }
  }

  // Check values in both
  const checkValues = (flatObj, lang, filePath) => {
    for (const [k, v] of Object.entries(flatObj)) {
      if (!v || v.trim() === "") {
        errors.push(`[${label}:${lang}] Key "${k}" has an empty value`);
      }
      if (v.includes("\u2014") || v.includes("\u2013")) {
        errors.push(`[${label}:${lang}] Key "${k}" contains forbidden em or en dash: "${v}"`);
      }
      const icuErr = checkIcuSyntax(v);
      if (icuErr) {
        errors.push(`[${label}:${lang}] Key "${k}" has invalid ICU syntax (${icuErr}): "${v}"`);
      }
    }
  };

  checkValues(enFlat, "en", enPath);
  checkValues(teFlat, "te", tePath);

  return errors;
}

export function runCheck() {
  const webEn = path.join(rootDir, "apps/web/messages/en.json");
  const webTe = path.join(rootDir, "apps/web/messages/te.json");
  const sharedEn = path.join(rootDir, "packages/shared/src/messages/en.json");
  const sharedTe = path.join(rootDir, "packages/shared/src/messages/te.json");

  const allErrors = [
    ...validateFilePair(sharedEn, sharedTe, "shared"),
    ...validateFilePair(webEn, webTe, "web"),
  ];

  if (allErrors.length > 0) {
    console.error("i18n check failed with errors:");
    for (const err of allErrors) {
      console.error("  - " + err);
    }
    return false;
  } else {
    console.log("i18n check passed: all keys match, non empty, no dashes, ICU valid.");
    return true;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const ok = runCheck();
  if (!ok) {
    process.exit(1);
  }
}
