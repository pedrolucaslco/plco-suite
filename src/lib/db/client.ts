"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      global: {
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        },
      },
      cookies: {
        getAll() {
          if (typeof document === "undefined") return [];
          return document.cookie.split("; ").filter(Boolean).map((c) => {
            const sep = c.indexOf("=");
            return { name: c.slice(0, sep), value: c.slice(sep + 1) };
          });
        },
        setAll(cookiesToSet) {
          if (typeof document === "undefined") return;
          for (const { name, value } of cookiesToSet) {
            document.cookie = `${name}=${value}; path=/; SameSite=Lax`;
          }
        },
      },
    },
  );
}
