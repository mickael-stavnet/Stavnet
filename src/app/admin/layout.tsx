import type { Metadata } from "next";
import "@/styles/globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Administration | STAVNET",
  description: "Gestion des auteurs affiches sur la vitrine 3D.",
  icons: {
    icon: "/icons/logo/icon-stavnet.jpg",
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="admin-interface min-h-full bg-zinc-50 font-sans text-foreground">
        {children}
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
