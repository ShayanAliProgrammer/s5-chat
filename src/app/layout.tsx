import "~/styles/globals.css";

import { type Metadata } from "next";
import { Toaster } from "~/components/ui/sonner";

export const metadata: Metadata = {
  title: "S5 Chat - The Fastest AI ChatApp",
  description:
    "S5 chat, an AI powered chat app built by Shayan Ali, currently in beta",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  authors: [{ name: "Shayan Ali", url: "https://shayanali.vercel.app/" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body>
        {children}

        <Toaster />
      </body>
    </html>
  );
}
