#!/usr/bin/env node
/**
 * Pre-commit secret-scan (T-01-SECRET-LEAK, PITFALLS #8).
 *
 * Enumerates staged files via `git diff --cached --name-only` and rejects
 * commits if any staged file:
 *   - is literally named `.env` / `.env.<anything>` except `.env.example`
 *   - contains a Stripe secret key (`sk_{live,test}_<20+ chars>`)
 *   - contains a Stripe live publishable key (`pk_live_<20+ chars>`)
 *   - contains an AWS access-key shape (`AKIA[0-9A-Z]{16}`)
 *   - contains generic .env-file content (KEY=VALUE lines — allowed only
 *     in files ending `.example`)
 *
 * Exits non-zero on any hit with a clear message. Husky v9 aborts the commit.
 */
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

const PATTERNS = [
  { name: "Stripe secret key", re: /\bsk_(live|test)_[A-Za-z0-9]{20,}/ },
  { name: "Stripe publishable live key", re: /\bpk_live_[A-Za-z0-9]{20,}/ },
  { name: "AWS access key id", re: /\bAKIA[0-9A-Z]{16}\b/ },
  { name: "Generic .env-file content", re: /^\s*[A-Z_][A-Z0-9_]*=.+$/m },
];

const DOTENV_FILENAMES = /(^|\/)\.env(\..+)?$/;
const BINARY_EXTS =
  /\.(png|jpe?g|gif|webp|ico|svg|pdf|zip|gz|tgz|mp3|mp4|mov|woff2?|ttf|otf|eot)$/i;

function staged() {
  const out = execSync("git diff --cached --name-only --diff-filter=ACMR", {
    encoding: "utf8",
  });
  return out.split("\n").filter(Boolean);
}

let failed = false;
for (const file of staged()) {
  // Rule 1: filename-based (block .env*, allow .env.example)
  if (DOTENV_FILENAMES.test(file) && !file.endsWith(".example")) {
    console.error(`[secret-scan] BLOCK: ${file} looks like an env file`);
    failed = true;
    continue;
  }

  // Skip known binary assets — their raw bytes decode as garbage UTF-8
  // that accidentally matches our KEY=VALUE generic-env pattern.
  if (BINARY_EXTS.test(file)) {
    continue;
  }

  // Rule 2: content-based (regex patterns)
  let body;
  try {
    body = readFileSync(file, "utf8");
  } catch {
    continue; // binary file or unreadable — skip
  }

  for (const { name, re } of PATTERNS) {
    if (re.test(body)) {
      // `.env.example` content matching KEY=VALUE is expected and OK
      if (name === "Generic .env-file content" && file.endsWith(".example")) {
        continue;
      }
      // Shell / yaml files legitimately use `VAR=value` and `VAR: value` syntax
      // for their own variable assignments. Skip the generic-env-content check
      // for these — the specific-key patterns (Stripe / AWS) still run.
      if (name === "Generic .env-file content" && /\.(sh|bash|zsh|ya?ml)$/.test(file)) {
        continue;
      }
      console.error(`[secret-scan] BLOCK: ${file} contains ${name}`);
      failed = true;
    }
  }
}

if (failed) {
  console.error("[secret-scan] commit blocked — remove the flagged values, re-stage, retry");
  process.exit(1);
}
