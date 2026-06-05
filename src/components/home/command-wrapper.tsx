"use client";

import { Command } from "@/components/ui/command";
import dynamic from "next/dynamic";

// On utilise le composant Command de base, mais encapsulé dans un wrapper client
export default function CommandWrapper(props: any) {
  return <Command {...props} />;
}
