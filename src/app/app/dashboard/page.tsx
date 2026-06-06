import { createClient } from "@/lib/db/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    redirect("/auth/login");
  }

  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <div className="text-center space-y-4">
        <h1 className="text-heading font-bold text-ink">
          Bem-vindo ao PLCO
        </h1>
        <p className="text-body text-ink-muted">
          Sua central familiar. Vamos começar!
        </p>
      </div>
    </div>
  );
}
