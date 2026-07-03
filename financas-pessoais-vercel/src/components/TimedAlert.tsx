"use client";

import { useEffect, useRef, useState } from "react";
import type { FlashMessageType } from "@/lib/flash";

type TimedAlertProps = {
  message: string;
  variant?: FlashMessageType;
  durationMs?: number;
  className?: string;
  onDismiss?: () => void;
};

const DEFAULT_DURATION_MS = 4200;

export function TimedAlert({
  message,
  variant = "error",
  durationMs = DEFAULT_DURATION_MS,
  className = "",
  onDismiss
}: TimedAlertProps) {
  const [visible, setVisible] = useState(Boolean(message));
  const [remainingMs, setRemainingMs] = useState(durationMs);
  const onDismissRef = useRef(onDismiss);

  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  useEffect(() => {
    if (!message) {
      setVisible(false);
      return;
    }

    setVisible(true);
    setRemainingMs(durationMs);

    const startedAt = Date.now();
    const intervalId = window.setInterval(() => {
      const nextRemaining = Math.max(0, durationMs - (Date.now() - startedAt));
      setRemainingMs(nextRemaining);

      if (nextRemaining <= 0) {
        window.clearInterval(intervalId);
        setVisible(false);
        onDismissRef.current?.();
      }
    }, 100);

    return () => window.clearInterval(intervalId);
  }, [durationMs, message]);

  if (!message || !visible) return null;

  const seconds = Math.max(1, Math.ceil(remainingMs / 1000));
  const progress = Math.max(0, Math.min(100, (remainingMs / durationMs) * 100));
  const role = variant === "error" ? "alert" : "status";

  return (
    <div className={`alert ${variant} timed-alert ${className}`.trim()} role={role} aria-live="polite">
      <span className="alert-message">{message}</span>
      <span className="alert-countdown" aria-label={`Fecha em ${seconds} segundos`}>
        {seconds}s
      </span>
      <span className="alert-progress" aria-hidden="true">
        <span style={{ width: `${progress}%` }} />
      </span>
    </div>
  );
}
