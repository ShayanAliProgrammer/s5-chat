import "~/styles/globals.css";

import { type Metadata } from "next";
import { Toaster } from "~/components/ui/sonner";
import { TooltipProvider } from "~/components/ui/tooltip";
import { env } from "~/env";
import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
  title: "S5 Chat - The Fastest AI ChatApp",
  description:
    "S5 chat, an AI powered chat app built by Shayan Ali, currently in beta",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  authors: [{ name: "Shayan Ali", url: "https://shayanali.vercel.app/" }],

  verification: {
    google: env.GOOGLE_SEARCH_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <TRPCReactProvider>
      <TooltipProvider>
        <html lang="en" className="dark h-svh w-svw">
          <body>
            {children}

            <Toaster />
          </body>
        </html>
      </TooltipProvider>
    </TRPCReactProvider>
  );
}
