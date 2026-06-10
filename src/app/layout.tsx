import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
 title: "PLCO — Sua família organizada como um time",
 description:
 "Organize tarefas, projetos e compromissos da sua família em um só lugar. App familiar feito para o slow living.",
 manifest: "/manifest.json",
 appleWebApp: {
 capable: true,
 statusBarStyle: "default",
 title: "PLCO",
 },
 icons: {
 icon: [
 { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
 { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
 ],
 apple: "/icons/icon-192.png",
 },
};

export const viewport: Viewport = {
 width: "device-width",
 initialScale: 1,
 maximumScale: 1,
 viewportFit: "cover",
 themeColor: [
 { media: "(prefers-color-scheme: light)", color: "#f2f5f7" },
 { media: "(prefers-color-scheme: dark)", color: "#000f24" },
 ],
};

export default function RootLayout({
 children,
}: Readonly<{
 children: React.ReactNode;
}>) {
 return (
 <html lang="pt-BR" className="h-full antialiased">
 <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
 {children}
 </body>
 </html>
 );
}
