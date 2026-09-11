import { NextResponse } from "next/server";

const requiredFields = ["bankName", "location", "contactName", "email", "bid", "requirements"];

export async function POST(request: Request) {
  const payload = await request.json();
  const missing = requiredFields.filter((field) => !String(payload[field] ?? "").trim());
  const bid = Number(payload.bid);

  if (missing.length || !Number.isFinite(bid) || bid < 0) {
    return NextResponse.json({ error: "Please complete all required bank and bid details." }, { status: 400 });
  }

  const reference = `TBD-${Date.now().toString(36).toUpperCase()}`;
  // Replace this hand-off point with CRM/email delivery when that integration is connected.
  console.info("Tailored bank deployment request", { reference, ...payload, bid });

  return NextResponse.json({ reference }, { status: 201 });
}
