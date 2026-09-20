"use client";

import { useSearchParams } from "next/navigation";

export function useMatchId() {
  const params = useSearchParams();
  return params.get("id") ?? "";
}
