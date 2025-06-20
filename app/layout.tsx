import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import QueryProvider from "@/utils/QueryProvider";
import "./globals.css";
import { ModeToggle } from "@/components/toggle";

export const metadata: Metadata = {
  title: "Hackagram",
  description: "A social media platform for hack-clubbers",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <>
      <html lang="en" suppressHydrationWarning>
        <head />
        <body className="antialiased">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <QueryProvider>
              {children}
              <div className="fixed bottom-6 left-6 z-10">
                <ModeToggle />
              </div>
            </QueryProvider>
          </ThemeProvider>
        </body>
      </html>
    </>
  );
}
  