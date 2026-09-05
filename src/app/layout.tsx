import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import "./globals.css";

export const metadata: Metadata = {
  title: "ONB — Outbox",
  description: "Outbox Labs Assignment",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-white text-neutral-900">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
