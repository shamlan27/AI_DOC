import type { Metadata } from "next";
import "./globals.css";
import Header from "../components/Layout/Header";
import Footer from "../components/Layout/Footer";

export const metadata: Metadata = {
  title: "SmartDoc AI - Smart Doctor Recommendation",
  description: "AI-powered platform to find the best doctor for your symptoms.",
};

import { AuthProvider } from '../context/AuthContext';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="font-sans antialiased min-h-screen flex flex-col"
      >
        <AuthProvider>
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
