"use client";

import NextDynamic from "next/dynamic";

const App = NextDynamic(() => import("~/frontend/app"));

export default function ChatPages() {
  return <App />;
}
