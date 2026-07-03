export type FlashMessageType = "success" | "error" | "warning";

export type FlashMessage = {
  type: FlashMessageType;
  message: string;
  durationMs?: number;
};

const FLASH_STORAGE_KEY = "financas-pessoais.flash-message";
const flashTypes: FlashMessageType[] = ["success", "error", "warning"];

export function setFlashMessage(flash: FlashMessage) {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.setItem(FLASH_STORAGE_KEY, JSON.stringify(flash));
  } catch {
    // If browser storage is unavailable, the app should still navigate normally.
  }
}

export function consumeFlashMessage(): FlashMessage | null {
  if (typeof window === "undefined") return null;

  let stored: string | null = null;

  try {
    stored = window.sessionStorage.getItem(FLASH_STORAGE_KEY);
    window.sessionStorage.removeItem(FLASH_STORAGE_KEY);
  } catch {
    return null;
  }

  if (!stored) return null;

  try {
    const parsed = JSON.parse(stored) as Partial<FlashMessage>;

    if (!parsed.message || !parsed.type || !flashTypes.includes(parsed.type)) {
      return null;
    }

    return {
      type: parsed.type,
      message: parsed.message,
      durationMs: parsed.durationMs
    };
  } catch {
    return null;
  }
}
