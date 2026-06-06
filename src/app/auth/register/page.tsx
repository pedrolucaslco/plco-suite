"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/db/client";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // Profile is created automatically by the on_auth_user_created trigger.
    // If a session was returned (email confirmation disabled), redirect.
    if (authData.session) {
      router.push("/app");
      router.refresh();
    } else {
      setMessage(
        "Conta criada! Verifique seu email para confirmar o cadastro.",
      );
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleRegister} className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-heading font-bold text-ink">
          Criar conta
        </h1>
        <p className="text-body text-ink-muted">
          Comece a organizar sua família
        </p>
      </div>

      {error && (
        <p className="text-sm text-deadline bg-deadline/10 rounded-md px-3 py-2">
          {error}
        </p>
      )}
      {message && (
        <p className="text-sm text-primary bg-primary/10 rounded-md px-3 py-2">
          {message}
        </p>
      )}

      <div className="space-y-4">
        <input
          type="text"
          placeholder="Seu nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full h-10 px-3 rounded-md border border-hairline bg-surface text-ink text-body placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full h-10 px-3 rounded-md border border-hairline bg-surface text-ink text-body placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="w-full h-10 px-3 rounded-md border border-hairline bg-surface text-ink text-body placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full h-10 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/80 disabled:opacity-50 transition-colors"
      >
        {loading ? "Criando..." : "Criar conta"}
      </button>

      <p className="text-center text-sm text-ink-muted">
        Já tem conta?{" "}
        <a href="/auth/login" className="text-primary hover:underline">
          Entrar
        </a>
      </p>
    </form>
  );
}
