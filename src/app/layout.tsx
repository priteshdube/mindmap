import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "MindPath — Your Career Wellness Companion",
  description:
    "A personalized mental wellness platform for students and professionals dealing with career pressure, burnout, and life stress.",
};
//Root function 
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#2f9b87",
          colorBackground: "#ffffff",
          colorInputBackground: "#f1eee4",
          colorInputText: "#1f2d2b",
        },
        elements: {
          formButtonPrimary:
            "bg-[#2f9b87] hover:bg-[#278370] transition-colors",
          card: "bg-[#ffffff] border border-[#d9e4e0]",
          headerTitle: "text-[#1f2d2b]",
          headerSubtitle: "text-[#6f7d79]",
          socialButtonsBlockButton:
            "bg-[#f1eee4] border border-[#d9e4e0] text-[#1f2d2b] hover:bg-[#ece7dc]",
          formFieldInput:
            "bg-[#f1eee4] border-[#d9e4e0] text-[#1f2d2b] focus:border-[#2f9b87]",
          footerActionLink: "text-[#2f9b87] hover:text-[#278370]",
        },
      }}
    >
      <html lang="en">
        <body className="bg-background text-text antialiased font-sans">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
