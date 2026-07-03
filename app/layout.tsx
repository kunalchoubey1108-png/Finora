import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SBI Agentic AI Acquisition & Onboarding Platform",
  description:
    "Agentic AI platform for predictive acquisition and digital onboarding.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
