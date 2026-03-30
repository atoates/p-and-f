import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Petal & Prosper | Floristry Business Management",
  description:
    "Simple and powerful floristry business management software. Manage enquiries, orders, proposals, invoices, and more.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-soft-cream">{children}</body>
    </html>
  );
}
