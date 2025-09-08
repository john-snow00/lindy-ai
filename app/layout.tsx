import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Trustpilot Fake Reviews Checker",
  description: "Analyze Trustpilot reviews to identify potentially fake or suspicious patterns. Get detailed insights and trust scores to make informed decisions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
