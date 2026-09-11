/**
 * lib/calleClient.ts
 * Thin wrapper around the CALL-E CLI (installed globally: @call-e/cli).
 */
import { execSync } from "child_process";

const CALLE_ENV = {
  CALLE_SOURCE: "skills_sh",
  CALLE_INTEGRATION: "skills_sh_skill",
  CALLE_INTEGRATION_VERSION: "0.1.0",
};

function calleEnvString(): string {
  return Object.entries(CALLE_ENV)
    .map(([k, v]) => `${k}=${v}`)
    .join(" ");
}

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

export function planCall(params: {
  toPhone: string;
  goal: string;
  language?: string;
  region?: string;
}): CallePlan {
  const { toPhone, goal, language, region } = params;
  let cmd =
    `env ${calleEnvString()} calle call plan` +
    ` --to-phone "${toPhone}"` +
    ` --goal "${goal.replace(/"/g, '\\"')}"` +
    ` --json`;
  if (language) cmd += ` --language "${language}"`;
  if (region)   cmd += ` --region "${region}"`;
  const raw = execSync(cmd, { encoding: "utf-8" });
  return JSON.parse(raw) as CallePlan;
}

export function runCall(planId: string): CalleRun {
  const cmd =
    `env ${calleEnvString()} calle call run --plan-id "${planId}" --json`;
  const raw = execSync(cmd, { encoding: "utf-8" });
  return JSON.parse(raw) as CalleRun;
}

export function getCallStatus(runId: string): CalleStatus {
  const cmd =
    `env ${calleEnvString()} calle call status --run-id "${runId}" --json`;
  const raw = execSync(cmd, { encoding: "utf-8" });
  return JSON.parse(raw) as CalleStatus;
}

export function startCall(params: {
  toPhone: string;
  goal: string;
  language?: string;
  region?: string;
}): CalleRun {
  const { toPhone, goal, language, region } = params;
  let cmd =
    `env ${calleEnvString()} calle call start` +
    ` --to-phone "${toPhone}"` +
    ` --goal "${goal.replace(/"/g, '\\"')}"` +
    ` --json`;
  if (language) cmd += ` --language "${language}"`;
  if (region)   cmd += ` --region "${region}"`;
  const raw = execSync(cmd, { encoding: "utf-8" });
  return JSON.parse(raw) as CalleRun;
}
