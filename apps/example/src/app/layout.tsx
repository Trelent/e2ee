import { TrelentE2EEProvider, usePassphraseStore } from "@trelent/e2ee-react";
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
  title: "End to End Encryption",
  description: "Demo app for @trelent/e2ee-react",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const store = usePassphraseStore();
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <TrelentE2EEProvider store={store}>{children}</TrelentE2EEProvider>
      </body>
    </html>
  );
}
