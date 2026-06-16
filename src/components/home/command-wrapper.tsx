"use client";

import * as React from "react";
import { Command } from "@/components/ui/command";

export default function CommandWrapper(
  props: React.ComponentProps<typeof Command>,
) {
  return <Command {...props} />;
}
