import type { Metadata } from "next";
import "./globals.css";
import { Navbar, Providers } from "@/components";

export const metadata: Metadata = {
  title: "CornerList - Book the Perfect DJ",
  description:
    "Find and book verified DJs for parties, formals, and campus events around UVA.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen antialiased">
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
