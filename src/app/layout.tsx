import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Manga Status Manager",
  description: "Manage your manga statuses and share recommendations via QR code.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
