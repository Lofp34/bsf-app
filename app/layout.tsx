import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Business Sud de France",
  description: "MVP mobile-first du réseau Business Sud de France",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
