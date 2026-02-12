import type { Metadata } from "next";
import ReduxProvider from "@/providers/ReduxProvider";
import AntdProvider from "@/providers/AntdProvider";
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
        <ReduxProvider>
          <AntdProvider>{children}</AntdProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
