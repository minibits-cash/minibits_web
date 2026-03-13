"use client";

import dynamic from "next/dynamic";

const NostrSection = dynamic(() => import("./NostrSection"), { ssr: false });

export default function NostrSectionLoader() {
  return <NostrSection />;
}
