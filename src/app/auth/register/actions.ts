"use server";

import { createClient } from "@/lib/db/server";
import { redirect } from "next/navigation";

export async function register(_prev: unknown, formData: FormData) {
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
    },
  });

  if (error) {
    return { error: error.message, message: null };
  }

  if (data.session) {
    redirect("/app");
  }

  return {
    error: null,
    message: "Conta criada! Verifique seu email para confirmar o cadastro.",
  };
}
