import { NextResponse } from "next/server";
import { runAcquisitionJourney } from "../../../lib/orchestrator";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const leadId = searchParams.get("lead") || undefined;
    const bankId = searchParams.get("bank") || undefined;
    const report = runAcquisitionJourney(leadId, bankId);
    return NextResponse.json(report);
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || String(err) },
      { status: 500 },
    );
  }
}
