"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { getClientToken } from "@/lib/client-token";
import { isJwtExpired } from "@/lib/jwt";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = getClientToken();
    router.replace(token && !isJwtExpired(token) ? "/dash/" : "/login/");
  }, [router]);

  return null;
}
