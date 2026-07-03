import { NextResponse } from "next/server";
import { runAcquisitionJourney } from "../../../lib/orchestrator";

export async function GET() {
  const report = runAcquisitionJourney();
  return NextResponse.json(report);
}
