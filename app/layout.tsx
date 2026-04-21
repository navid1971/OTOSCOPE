import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OTOSCOPE",
  description: "A professional ENT medical camera interface prototype with live video streaming and hardware connection verification.",
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
