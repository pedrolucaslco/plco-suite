"use client";

import { useActionState } from "react";
import { login } from "./actions";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, { error: null });

  return (
    <form action={formAction} className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-heading font-bold text-ink">Entrar</h1>
        <p className="text-body text-ink-muted">
          Acesse sua conta familiar
        </p>
      </div>

      {state?.error && (
        <p className="text-sm text-deadline bg-deadline/10 rounded-md px-3 py-2">
          {state.error}
        </p>
      )}

      <div className="space-y-4">
        <input
          type="email"
          name="email"
          placeholder="Email"
          required
          className="w-full h-10 px-3 rounded-md border border-hairline bg-surface text-ink text-body placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
        />
        <input
          type="password"
          name="password"
          placeholder="Senha"
          required
          className="w-full h-10 px-3 rounded-md border border-hairline bg-surface text-ink text-body placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full h-10 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/80 disabled:opacity-50 transition-colors"
      >
        {pending ? "Entrando..." : "Entrar"}
      </button>

      <p className="text-center text-sm text-ink-muted">
        Não tem conta?{" "}
        <a href="/auth/register" className="text-primary hover:underline">
          Criar conta
        </a>
      </p>
    </form>
  );
}
