import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Scale System | Microservices Infrastructure",
  description: "High-scale multi-tenant microservices platform with RabbitMQ and gRPC",
};

import { SettingsProvider } from "@/context/SettingsContext";

import { SuperAdminAuthProvider } from '@/context/SuperAdminAuthContext';
import { TenantAuthProvider } from '@/context/TenantAuthContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={geistSans.variable}>
        <SuperAdminAuthProvider>
          <TenantAuthProvider>
            <SettingsProvider>
              {children}
            </SettingsProvider>
          </TenantAuthProvider>
        </SuperAdminAuthProvider>
      </body>
    </html>
  );
}
