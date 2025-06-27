import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Provider } from "./provider"
import Navbar from "@/components/layout/Navbar"

// Configure Inter font as a fallback
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Flame Audio AI",
  description: "AI-powered audio transcription and analysis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Provider>
        <body className={inter.className}>
          <div className="relative flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
          </div>
        </body>
      </Provider>
    </html>
  )
}
