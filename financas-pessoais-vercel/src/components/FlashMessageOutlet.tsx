"use client";

import { useEffect, useState } from "react";
import { consumeFlashMessage } from "@/lib/flash";
import type { FlashMessage } from "@/lib/flash";
import { TimedAlert } from "@/components/TimedAlert";

type FlashMessageOutletProps = {
  className?: string;
};

export function FlashMessageOutlet({ className = "" }: FlashMessageOutletProps) {
  const [flash, setFlash] = useState<FlashMessage | null>(null);

  useEffect(() => {
    setFlash(consumeFlashMessage());
  }, []);

  if (!flash) return null;

  return (
    <TimedAlert
      className={className}
      durationMs={flash.durationMs}
      message={flash.message}
      onDismiss={() => setFlash(null)}
      variant={flash.type}
    />
  );
}
