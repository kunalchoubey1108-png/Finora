/**
 * GET /api/calls/call-status?runId=xxx
 *
 * Polls CALL-E for current call run status & result.
 * Used by the Call Center dashboard to show live updates.
 */

import { NextRequest, NextResponse } from "next/server";
import { getCallStatus } from "../../../../lib/calleClient";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const runId = searchParams.get("runId");
    if (!runId) {
      return NextResponse.json({ ok: false, error: "runId query param required" }, { status: 400 });
    }
    const status = await getCallStatus(runId);
    return NextResponse.json({ ok: true, ...status });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
