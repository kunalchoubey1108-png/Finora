import { NextResponse } from "next/server";
import { createAuditRecord } from "../../../../lib/governance";

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    // Create a lightweight audit record for the send action
    const audit = createAuditRecord(
      "Content Send",
      "Queued",
      "Enqueued from Content Studio",
      90,
      false,
      "Acquisition Ops",
      "Queued for delivery via orchestrator",
    );

    // In a real app, you'd enqueue to a delivery system or call orchestrator functions.
    // For demo, return the audit record and echo payload.
    return NextResponse.json({ status: "queued", audit, received: payload });
  } catch (err) {
    return NextResponse.json(
      { status: "error", error: String(err) },
      { status: 500 },
    );
  }
}
