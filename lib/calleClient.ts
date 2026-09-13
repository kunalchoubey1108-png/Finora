/**
 * Production-safe wrapper around the bundled CALL-E CLI.
 *
 * Vercel functions do not have access to a developer's global `calle` binary
 * or home-directory token cache. The CLI is installed as an application
 * dependency and its token cache is reconstructed in the function's writable
 * temporary directory from the encrypted CALLE_TOKEN_CACHE_JSON secret.
 */
import { createHash } from "crypto";
import { mkdirSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { runCli } from "@call-e/cli/lib/cli.js";

const DEFAULT_CALLE_SERVER_URL =
  "https://seleven-mcp-sg.airudder.com/mcp/openagent_oauth";
const CALLE_ENV = {
  CALLE_SOURCE: "skills_sh",
  CALLE_INTEGRATION: "skills_sh_skill",
  CALLE_INTEGRATION_VERSION: "0.1.0",
};

export type CallePlan = {
  plan_id: string;
  status: string;
  to_phone: string;
  goal: string;
  language?: string;
  region?: string;
  [key: string]: unknown;
};

export type CalleRun = {
  run_id: string;
  plan_id: string;
  status: string;
  result?: {
    summary?: string;
    transcript?: string;
    outcome?: string;
    sentiment_score?: number;
    [key: string]: unknown;
  };
  next_action?: {
    action: string;
    instruction: string;
    required_user_input?: { key: string; label: string; reason: string }[];
  };
  [key: string]: unknown;
};

export type CalleStatus = {
  run_id: string;
  status: string;
  result?: CalleRun["result"];
  [key: string]: unknown;
};

function prepareTokenCache() {
  const rawTokenCache = process.env.CALLE_TOKEN_CACHE_JSON;
  if (!rawTokenCache) {
    throw new Error(
      "CALL-E is not configured. Add CALLE_TOKEN_CACHE_JSON to the deployment environment before placing live calls.",
    );
  }

  let tokenCache: unknown;
  try {
    tokenCache = JSON.parse(rawTokenCache);
  } catch {
    throw new Error("CALLE_TOKEN_CACHE_JSON must contain valid JSON from CALL-E's token cache.");
  }

  if (
    !tokenCache ||
    typeof tokenCache !== "object" ||
    !("token" in tokenCache) ||
    !tokenCache.token ||
    typeof tokenCache.token !== "object" ||
    !("access_token" in tokenCache.token) ||
    typeof tokenCache.token.access_token !== "string" ||
    !tokenCache.token.access_token
  ) {
    throw new Error("CALLE_TOKEN_CACHE_JSON does not contain a usable CALL-E access token.");
  }

  const serverUrl = process.env.CALLE_SERVER_URL || DEFAULT_CALLE_SERVER_URL;
  const cacheRoot = join(tmpdir(), "calle-mcp", "cli");
  const serverHash = createHash("md5").update(serverUrl, "utf8").digest("hex");
  const cacheDirectory = join(cacheRoot, serverHash);
  mkdirSync(cacheDirectory, { recursive: true, mode: 0o700 });
  writeFileSync(join(cacheDirectory, "token.json"), JSON.stringify(tokenCache), {
    encoding: "utf8",
    mode: 0o600,
  });

  return { cacheRoot, serverUrl };
}

async function runCalle(args: string[]) {
  const { cacheRoot, serverUrl } = prepareTokenCache();
  let stdout = "";
  let stderr = "";
  const exitCode = await runCli(
    [...args, "--cache-root", cacheRoot, "--server-url", serverUrl],
    {
      env: { ...process.env, ...CALLE_ENV },
      stdout: (text: string) => { stdout += text; },
      stderr: (text: string) => { stderr += text; },
    },
  );
  if (exitCode !== 0) {
    throw new Error(stderr.trim() || "CALL-E did not complete the request.");
  }
  return JSON.parse(stdout) as Record<string, unknown>;
}

export function planCall(params: {
  toPhone: string;
  goal: string;
  language?: string;
  region?: string;
}): Promise<CallePlan> {
  const args = ["call", "plan", "--to-phone", params.toPhone, "--goal", params.goal, "--json"];
  if (params.language) args.push("--language", params.language);
  if (params.region) args.push("--region", params.region);
  return runCalle(args) as Promise<CallePlan>;
}

export function runCall(planId: string, confirmToken: string): Promise<CalleRun> {
  return runCalle([
    "call",
    "run",
    "--plan-id",
    planId,
    "--confirm-token",
    confirmToken,
    "--json",
  ]) as Promise<CalleRun>;
}

export function getCallStatus(runId: string): Promise<CalleStatus> {
  return runCalle(["call", "status", "--run-id", runId, "--json"]) as Promise<CalleStatus>;
}

export function startCall(params: {
  toPhone: string;
  goal: string;
  language?: string;
  region?: string;
}): Promise<CalleRun> {
  const args = ["call", "start", "--to-phone", params.toPhone, "--goal", params.goal, "--json"];
  if (params.language) args.push("--language", params.language);
  if (params.region) args.push("--region", params.region);
  return runCalle(args) as Promise<CalleRun>;
}
