import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Soccer Situation Monitor",
  description: "Analyst dashboard for European soccer market signals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
