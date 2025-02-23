"use client";

import React from "react";
import Loading from "../loading";

export const dynamic = "force-static";

export default function Layout({ children }: { children: React.ReactNode }) {
  if (typeof window == "undefined") return <Loading />;

  return children;
}
