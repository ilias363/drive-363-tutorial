import "~/styles/globals.css";
import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { PostHogProvider } from "./_providers/posthog-provider";
import { dark } from "@clerk/themes";

export const metadata: Metadata = {
  title: "Drive363 Tutorial",
  description: "The worst Google Drive clone",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
      }}
    >
      <html lang="en" className={`${GeistSans.variable}`}>
        <body className="bg-gradient-to-br from-black via-neutral-900 to-neutral-800">
          <PostHogProvider>{children}</PostHogProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
