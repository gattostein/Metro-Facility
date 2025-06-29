import { Geist, Geist_Mono } from "next/font/google";
import { ReactNode } from "react";
import "./globals.css";
import Navbar from "./Navbar"; // Importamos el componente de Navbar que está en un archivo separado

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Aquí no exportamos 'metadata', ya que se mueve a un archivo separado

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Navbar />
        <main className="max-w-4xl mx-auto p-4">{children}</main>
      </body>
    </html>
  );
}
