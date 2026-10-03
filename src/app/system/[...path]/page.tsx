"use client";

import { UnifiedSystemPages, SystemPageState } from "@/components/system/UnifiedSystemPages";

function mapSlugToState(slug?: string): SystemPageState {
  if (!slug) return "loading";
  const s = slug.toLowerCase();
  
  if (s === "404" || s === "not-found") return "404";
  if (s === "403" || s === "forbidden" || s === "access-denied" || s === "permission-denied" || s === "401" || s === "unauthorized") return "permission-denied";
  if (s === "500" || s === "server-error" || s === "something-went-wrong" || s === "error") return "server-error";
  if (s === "offline" || s === "no-internet" || s === "network-error") return "no-internet";
  if (s === "maintenance" || s === "maintenance-mode") return "maintenance";
  if (s === "loading" || s === "loader") return "loading";
  if (s === "empty" || s === "empty-state") return "empty";
  if (s === "session-expired") return "session-expired";
  if (s === "verification-failed") return "verification-failed";
  if (s === "upload-error" || s === "upload-failed") return "upload-error";
  if (s === "payment-error" || s === "payment-failed") return "payment-error";
  if (s === "account-suspended" || s === "suspended") return "account-suspended";
  if (s === "success" || s === "success-confirmation") return "success-confirmation";
  if (s === "delete-confirmation") return "delete-confirmation";
  
  return "loading";
}

export default function SystemCatchAllPage({ params }: { params: { path: string[] } }) {
  const resolvedState = mapSlugToState(params?.path?.[0]);
  return <UnifiedSystemPages initialState={resolvedState} />;
}
