"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/db/client";
import { useNucleusStore } from "@/stores/nucleus";

export default function AppRootPage() {
  const [checking, setChecking] = useState(true);
  const router = useRouter();
  const supabase = createClient();
  const setCurrentNucleus = useNucleusStore((s) => s.setCurrentNucleus);

  useEffect(() => {
    async function check() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!profile) {
        router.push("/app/onboarding");
        return;
      }

      const { data: nuclei } = await supabase
        .from("nuclei_members")
        .select("nuclei_id")
        .eq("user_id", profile.id);

      if (!nuclei || nuclei.length === 0) {
        router.push("/app/onboarding");
        return;
      }

      const first = nuclei[0].nuclei_id;
      setCurrentNucleus(first);
      router.push("/app/inbox");
    }

    check().then(() => setChecking(false));
  }, [router, supabase, setCurrentNucleus]);

  if (checking) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-ink-muted text-body">Carregando...</p>
      </div>
    );
  }

  return null;
}
