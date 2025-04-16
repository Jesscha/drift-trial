import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/layout/Header";
import { Providers } from "./providers/Providers";

export const metadata: Metadata = {
  title: "Drift Protocol Frontend",
  description: "A frontend interface for the Drift Protocol",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <div className="flex flex-col min-h-screen bg-neutrals-0 dark:bg-neutrals-90 text-neutrals-100 dark:text-neutrals-0">
            <Header />
            <main className="flex-grow">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
