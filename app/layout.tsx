import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ledger AI - An auditable AI workspace",
  description: "Understand, audit, and replay every AI decision.",
  icons: {
    icon: "/Logo.png",
    shortcut: "/Logo.png",
    apple: "/Logo.png",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
