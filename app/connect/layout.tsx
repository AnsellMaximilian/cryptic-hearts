"use client";

import React from "react";
import { Realtime } from "ably";
import { AblyProvider } from "ably/react";

const client = new Realtime.Promise({
  authMethod: "POST",
  authUrl: `${
    process.env.NEXT_PUBLIC_MODE === "production"
      ? "https://cryptic-hearts.vercel.app"
      : "http://localhost:3000"
  }/api/ably-auth`,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AblyProvider client={client}>{children}</AblyProvider>;
}
