"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface StavnetLoadingIndicatorProps {
  className?: string;
}

export function StavnetLoadingIndicator({
  className,
}: StavnetLoadingIndicatorProps) {
  const [progress, setProgress] = useState(6);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setProgress((current) => {
        if (current >= 96) {
          return 96;
        }

        if (current < 40) {
          return Math.min(96, current + 6);
        }

        if (current < 72) {
          return Math.min(96, current + 4);
        }

        return Math.min(96, current + 2);
      });
    }, 180);

    return () => window.clearInterval(timer);
  }, []);
  const center = 54;
  const radius = 30;
  const startAngle = -88;
  const sweepAngle = 196;
  const endAngle = startAngle + sweepAngle;

  const polarToCartesian = (angle: number, r: number) => {
    const radians = (angle * Math.PI) / 180;
    return {
      x: center + r * Math.cos(radians),
      y: center + r * Math.sin(radians),
    };
  };

  const describeArc = (start: number, end: number, r: number) => {
    const startPoint = polarToCartesian(start, r);
    const endPoint = polarToCartesian(end, r);
    const largeArcFlag = end - start > 180 ? 1 : 0;

    return [
      `M ${startPoint.x} ${startPoint.y}`,
      `A ${r} ${r} 0 ${largeArcFlag} 1 ${endPoint.x} ${endPoint.y}`,
    ].join(" ");
  };

  const progressEnd = startAngle + (sweepAngle * progress) / 100;
  const arcPath = describeArc(startAngle, progressEnd, radius);

  return (
    <div className={cn("flex h-full min-h-[320px] items-center justify-center", className)}>
      <div className="relative h-[108px] w-[108px]">
        <svg viewBox="0 0 108 108" className="h-full w-full" aria-hidden="true">
          <path
            d={arcPath}
            fill="none"
            stroke="#ffd84d"
            strokeWidth="3"
            strokeLinecap="round"
            className="transition-all duration-200 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-[24px] font-normal leading-none tabular-nums text-[#ffd84d]">
          {progress}%
        </div>
      </div>
    </div>
  );
}
