import { NextResponse } from "next/server";
import { runAgentOrchestration } from "../../../lib/agents/orchestrator";

export async function GET() {
  const report = runAgentOrchestration();
  return NextResponse.json(report);
}
