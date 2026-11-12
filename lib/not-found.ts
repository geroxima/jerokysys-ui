import "server-only";

import { notFound } from "next/navigation";

import { ApiError } from "@/lib/academic/client";

export async function notFoundOn404<T>(request: Promise<T>): Promise<T> {
  try {
    return await request;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
}
