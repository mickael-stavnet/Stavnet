"use client";

import { gsap } from "gsap";
import { ReactNode, useEffect, useRef } from "react";
import { usePathname } from "@/i18n/routing";

interface PageMotionProps {
  children: ReactNode;
}

export function PageMotion({ children }: PageMotionProps) {
  const pathname = usePathname();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(root, { clearProps: "all" });
      return;
    }

    const animatedNodes = Array.from(
      root.querySelectorAll<HTMLElement>("[data-stavnet-animate]"),
    );

    const ctx = gsap.context(() => {
      gsap.fromTo(
        root,
        { autoAlpha: 0, y: 18 },
        { autoAlpha: 1, y: 0, duration: 0.45, ease: "power2.out" },
      );

      if (animatedNodes.length) {
        gsap.fromTo(
          animatedNodes,
          { autoAlpha: 0, y: 22 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.55,
            stagger: 0.08,
            ease: "power2.out",
            delay: 0.08,
          },
        );
      }
    }, root);

    return () => ctx.revert();
  }, [pathname]);

  return <div ref={rootRef}>{children}</div>;
}
