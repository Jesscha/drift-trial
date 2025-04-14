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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
            (function() {
              // On page load or when changing themes, best to add inline in \`head\` to avoid FOUC
              if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.documentElement.classList.add('dark');
              } else {
                document.documentElement.classList.remove('dark');
              }
            })()
          `,
          }}
        />
      </head>
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
