import { runAgentOrchestration } from "./agents/orchestrator";
import type { AgentFlowReport } from "./types";

export function runAcquisitionJourney(): AgentFlowReport {
  return runAgentOrchestration();
}
