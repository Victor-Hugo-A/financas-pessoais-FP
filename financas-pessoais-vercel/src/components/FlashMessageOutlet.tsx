"use client";

import { useEffect, useState } from "react";
import { consumeFlashMessage } from "@/lib/flash";
import type { FlashMessage } from "@/lib/flash";
import { TimedAlert } from "@/components/TimedAlert";

export function FlashMessageOutlet() {
  const [flash, setFlash] = useState<FlashMessage | null>(null);

  useEffect(() => {
    setFlash(consumeFlashMessage());
  }, []);

  if (!flash) return null;

  return (
    <TimedAlert
      durationMs={flash.durationMs}
      message={flash.message}
      onDismiss={() => setFlash(null)}
      variant={flash.type}
    />
  );
}
