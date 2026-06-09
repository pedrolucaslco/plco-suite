"use client";

import { useActionState } from "react";
import { register } from "./actions";

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(register, { error: null, message: null });

  return (
    <form action={formAction} className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-heading font-bold text-ink">
          Criar conta
        </h1>
        <p className="text-body text-ink-muted">
          Comece a organizar sua família
        </p>
      </div>

      {state?.error && (
        <p className="text-sm text-deadline bg-deadline/10 rounded-md px-3 py-2">
          {state.error}
        </p>
      )}
      {state?.message && (
        <p className="text-sm text-primary bg-primary/10 rounded-md px-3 py-2">
          {state.message}
        </p>
      )}

      <div className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Seu nome"
          required
          className="w-full h-10 px-3 rounded-md border border-hairline bg-surface text-ink text-body placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
        />
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
          minLength={6}
          className="w-full h-10 px-3 rounded-md border border-hairline bg-surface text-ink text-body placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full h-10 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/80 disabled:opacity-50 transition-colors"
      >
        {pending ? "Criando..." : "Criar conta"}
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
