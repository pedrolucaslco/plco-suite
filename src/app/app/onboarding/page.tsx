"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/db/client";
import { useNucleusStore } from "@/stores/nucleus";

export default function OnboardingPage() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();
  const setCurrentNucleus = useNucleusStore((s) => s.setCurrentNucleus);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("Usuário não autenticado");
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!profile) {
      setError("Perfil não encontrado");
      setLoading(false);
      return;
    }

    const { data: nucleus, error: nErr } = await supabase
      .from("nuclei")
      .insert({ name, created_by: profile.id })
      .select()
      .single();

    if (nErr || !nucleus) {
      setError(nErr?.message ?? "Erro ao criar núcleo");
      setLoading(false);
      return;
    }

    const { error: mErr } = await supabase.from("nuclei_members").insert({
      nuclei_id: nucleus.id,
      user_id: profile.id,
      role: "member",
    });

    if (mErr) {
      setError(mErr.message);
      setLoading(false);
      return;
    }

    setCurrentNucleus(nucleus.id);
    router.push("/app/inbox");
  }

  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-heading font-bold text-ink">
            Criar nova família
          </h1>
          <p className="text-body text-ink-muted">
            Dê um nome para o seu núcleo familiar
          </p>
        </div>

        {error && (
          <p className="text-sm text-deadline bg-deadline/10 rounded-md px-3 py-2">
            {error}
          </p>
        )}

        <input
          type="text"
          placeholder="Ex: Família Silva"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full h-10 px-3 rounded-md border border-hairline bg-canvas text-ink text-body placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full h-10 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/80 disabled:opacity-50 transition-colors"
        >
          {loading ? "Criando..." : "Criar família"}
        </button>
      </form>
    </div>
  );
}
