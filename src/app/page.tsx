export default function Home() {
 return (
 <div className="flex flex-col flex-1">
 <header className="flex items-center justify-between px-6 py-4">
 <span className=" font-bold text-foreground">PLCO</span>
 <nav className="flex items-center gap-4">
 <a
 href="/auth/login"
 className=" text-muted-foreground hover:text-foreground transition-colors"
 >
 Entrar
 </a>
 <a
 href="/auth/register"
 className="inline-flex h-9 items-center px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/80 transition-colors"
 >
 Começar grátis
 </a>
 </nav>
 </header>
 <main className="flex-1 flex flex-col items-center justify-center px-6 py-20">
 <div className="max-w-lg text-center space-y-6">
 <h1 className=" font-bold text-foreground">
 Sua família organizada como um time
 </h1>
 <p className=" text-foreground/80 leading-relaxed">
 Chega de listas de tarefas egoístas. PLCO é o app de organização
 familiar — tarefas, projetos, calendário e notas compartilhadas em
 um só lugar. Feito para o slow living.
 </p>
 <div className="pt-4">
 <a
 href="/auth/register"
 className="inline-flex h-10 items-center px-6 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/80 transition-colors"
 >
 Criar minha família gratuitamente
 </a>
 </div>
 </div>
 </main>
 </div>
 );
}
