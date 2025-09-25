import type { Metadata } from "next";
import {  Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { SocketProvider } from "../context/SocketContext";
// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({ subsets: ["latin"] });
export const metadata: Metadata = {
  title: "Intervue Live Poll",
  description: "A real-time polling application.",
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SocketProvider>{children}</SocketProvider>
      </body>
    </html>
  );
}
