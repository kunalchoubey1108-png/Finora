import Link from "next/link";

export default function GenericShowcasePage() {
  return (
    <main className="editorial-page">
      <div className="editorial-container py-10 md:py-16">
        <nav className="flex items-center justify-between text-sm">
          <span className="text-[#979799]">Agentic banking platform</span>
          <Link href="/tailored-banking" className="text-[#17191c] hover:underline">Tailor this platform →</Link>
        </nav>

        <section className="py-24 text-center md:py-32">
          <p className="editorial-eyebrow">A configurable product experience</p>
          <h1 className="editorial-title mx-auto mt-5 max-w-4xl">
            Accountable banking, <em>by design.</em>
          </h1>
          <p className="editorial-subhead mx-auto mt-6">
            A neutral preview of an agentic acquisition and onboarding platform. Configure the workflows, policies, products and brand for any institution.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link href="/tailored-banking" className="editorial-pill editorial-pill--filled">Request a tailored version</Link>
            <Link href="/" className="editorial-pill editorial-pill--ghost">View a configured demo</Link>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-3">
          <article className="editorial-card p-6">
            <p className="editorial-eyebrow">01 / Acquire</p>
            <h2 className="font-display mt-4 text-3xl tracking-[-0.03em]">Prioritize the right customer.</h2>
            <p className="mt-4 text-sm leading-6 text-[#777b86]">Explainable scoring makes growth decisions clear and reviewable.</p>
          </article>
          <article className="editorial-artifact p-6">
            <p className="editorial-eyebrow">02 / Personalize</p>
            <h2 className="font-display mt-4 text-3xl tracking-[-0.03em]">Make every offer relevant.</h2>
            <p className="mt-4 text-sm leading-6 text-[#777b86]">Product and channel recommendations adapt to your portfolio and policy.</p>
          </article>
          <article className="editorial-card p-6">
            <p className="editorial-eyebrow">03 / Govern</p>
            <h2 className="font-display mt-4 text-3xl tracking-[-0.03em]">Keep people in control.</h2>
            <p className="mt-4 text-sm leading-6 text-[#777b86]">Each agent decision arrives with traceability, safeguards and review paths.</p>
          </article>
        </section>
      </div>
    </main>
  );
}
