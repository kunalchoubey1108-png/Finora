import type { Metadata } from "next";
import "./globals.css";
import { BankProvider } from "../components/BankContext";
import Header from "../components/Header";

export const metadata: Metadata = {
  title: "Agentic Bank Onboarding Platform",
  description:
    "White-labelable agentic AI platform for bank customer acquisition and digital onboarding.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <BankProvider>
          <Header />
          {children}
        </BankProvider>
      </body>
    </html>
  );
}
