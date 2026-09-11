import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Keeps the screen awake using the Screen Wake Lock API.
 *
 * Requirements:
 *  - A secure context: https, or http on localhost. Over plain http on a LAN
 *    IP the API is not exposed at all, and this returns "unsupported".
 *  - A visible page. The browser drops the lock when the tab is hidden or the
 *    phone is locked, so we re-acquire on visibilitychange.
 *
 * Some browsers only grant the lock after a user gesture, so we also retry on
 * the first tap.
 */
export function useWakeLock(enabled = true) {
  const sentinel = useRef(null);
  // idle | active | unsupported | denied
  const [state, setState] = useState(() =>
    typeof navigator !== "undefined" && "wakeLock" in navigator ? "idle" : "unsupported"
  );

  const request = useCallback(async () => {
    if (!("wakeLock" in navigator)) return;
    if (sentinel.current || document.visibilityState !== "visible") return;
    try {
      sentinel.current = await navigator.wakeLock.request("screen");
      sentinel.current.addEventListener("release", () => {
        sentinel.current = null;
        setState("idle");
      });
      setState("active");
    } catch {
      // Thrown when the gesture/permission requirements are not met.
      setState("denied");
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      sentinel.current?.release();
      sentinel.current = null;
      return;
    }

    // Acquiring an OS-level wake lock is exactly the external-system sync an
    // effect is for; the state update happens after the await, not synchronously.
    // oxlint-disable-next-line react/set-state-in-effect
    request();

    const onVisibility = () => {
      if (document.visibilityState === "visible") request();
    };
    const onGesture = () => request();

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("click", onGesture);
    window.addEventListener("touchend", onGesture);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("click", onGesture);
      window.removeEventListener("touchend", onGesture);
      sentinel.current?.release();
      sentinel.current = null;
    };
  }, [enabled, request]);

  return state;
}
