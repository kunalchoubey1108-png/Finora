import { runAgentOrchestration } from "./agents/orchestrator";
import type { AgentFlowReport } from "./types";

export function runAcquisitionJourney(leadId?: string, bankId?: string): AgentFlowReport {
  return runAgentOrchestration(leadId, bankId);
}
