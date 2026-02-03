import type { Metadata } from "next";
import ReduxProvider from "@/providers/ReduxProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Admin Panel",
  description: "Admin system for managing applications",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  );
}
