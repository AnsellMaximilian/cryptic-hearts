"use client";

import React from "react";
import { Realtime } from "ably";
import { AblyProvider, useChannel, usePresence } from "ably/react";

const client = new Realtime.Promise({
  authUrl: `${
    process.env.NEXT_PUBLIC_MODE === "production"
      ? "https://mading-live.vercel.app"
      : "http://localhost:3000"
  }/api/ably-auth`,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AblyProvider client={client}>{children}</AblyProvider>;
}
