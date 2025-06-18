import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import QueryProvider from "@/utils/QueryProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hackagram",
  description: "A social media platform for hack-clubbers",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            {children}
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
