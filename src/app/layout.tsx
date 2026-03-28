import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import "./globals.css";

export const metadata: Metadata = {
  title: "MindPath — Your Career Wellness Companion",
  description:
    "A personalized mental wellness platform for students and professionals dealing with career pressure, burnout, and life stress.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#7c6ff7",
          colorBackground: "#1a1a24",
          colorInputBackground: "#22222f",
          colorInputText: "#e8e8f0",
        },
        elements: {
          formButtonPrimary:
            "bg-[#7c6ff7] hover:bg-[#6b5fd6] transition-colors",
          card: "bg-[#1a1a24] border border-[#2e2e3e]",
          headerTitle: "text-[#e8e8f0]",
          headerSubtitle: "text-[#6b6b80]",
          socialButtonsBlockButton:
            "bg-[#22222f] border border-[#2e2e3e] text-[#e8e8f0] hover:bg-[#2e2e3e]",
          formFieldInput:
            "bg-[#22222f] border-[#2e2e3e] text-[#e8e8f0] focus:border-[#7c6ff7]",
          footerActionLink: "text-[#7c6ff7] hover:text-[#6b5fd6]",
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
