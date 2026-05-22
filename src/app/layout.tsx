import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "3M FlutterBoot | Mentorship Portal",
  description: "Exclusive private learning hub for the 3-Month Flutter Bootcamp.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} dark`}>
      <body className="font-sans bg-zinc-950 text-zinc-100 min-h-screen antialiased selection:bg-cyan-500/30 selection:text-cyan-300">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
