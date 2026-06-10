"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/db/client";

export default function LoginPage() {
 const [email, setEmail] = useState("");
 const [password, setPassword] = useState("");
 const [error, setError] = useState<string | null>(null);
 const [loading, setLoading] = useState(false);
 const router = useRouter();
 const supabase = createClient();

 async function handleLogin(e: React.FormEvent) {
 e.preventDefault();
 setError(null);
 setLoading(true);

 const { error } = await supabase.auth.signInWithPassword({
 email,
 password,
 });

 if (error) {
 setError(error.message);
 setLoading(false);
 return;
 }

 router.push("/app");
 router.refresh();
 }

 return (
 <form onSubmit={handleLogin} className="space-y-6">
 <div className="text-center space-y-2">
 <h1 className=" font-bold text-foreground">Entrar</h1>
 <p className=" text-muted-foreground">
 Acesse sua conta familiar
 </p>
 </div>

 {error && (
 <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
 {error}
 </p>
 )}

 <div className="space-y-4">
 <input
 type="email"
 placeholder="Email"
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 required
 className="w-full h-10 px-3 rounded-md border border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
 />
 <input
 type="password"
 placeholder="Senha"
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 required
 className="w-full h-10 px-3 rounded-md border border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
 />
 </div>

 <button
 type="submit"
 disabled={loading}
 className="w-full h-10 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/80 disabled:opacity-50 transition-colors"
 >
 {loading ? "Entrando..." : "Entrar"}
 </button>

 <p className="text-center text-sm text-muted-foreground">
 Não tem conta?{" "}
 <a href="/auth/register" className="text-primary hover:underline">
 Criar conta
 </a>
 </p>
 </form>
 );
}
