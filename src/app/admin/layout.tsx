import type { Metadata } from "next";
import "@/styles/globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Administration | STAVNET",
  description: "Gestion des auteurs affiches sur la vitrine 3D.",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="admin-interface min-h-full bg-white font-sans text-foreground">
        {children}
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
