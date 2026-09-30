"use client";

import { UnifiedSystemPages, SystemPageState } from "@/components/system/UnifiedSystemPages";

export default function SystemCatchAllPage({ params }: { params: { path: string[] } }) {
  const slug = params?.path?.[0] as SystemPageState | undefined;
  return <UnifiedSystemPages initialState={slug || "loading"} />;
}
