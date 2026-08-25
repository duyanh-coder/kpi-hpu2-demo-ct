import type { Metadata } from "next";
import { K2D, Barlow } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/layout/ClientLayout";
import AuthProvider from "@/providers/AuthProvider";

const k2d = K2D({
  subsets: ["latin"],
  variable: "--font-k2d",
  weight: ["300", "400", "500", "600", "700"],
});

const barlow = Barlow({
  subsets: ["latin"],
  variable: "--font-barlow",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Hệ thống KPI - Đại học Sư phạm Hà Nội 2",
  description: "Hệ thống quản lý công việc và đánh giá KPI - Đại học Sư phạm Hà Nội 2",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${k2d.variable} ${barlow.variable} antialiased`}>
        <AuthProvider>
          <div className="flex min-h-screen">
            <ClientLayout>{children}</ClientLayout>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
