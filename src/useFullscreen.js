import { useCallback, useEffect, useState } from "react";

// Safari still needs the prefixed calls, and iPadOS only has the prefixed ones.
const enter = (el) =>
  el.requestFullscreen?.() ?? el.webkitRequestFullscreen?.();
const leave = () => document.exitFullscreen?.() ?? document.webkitExitFullscreen?.();
const current = () => document.fullscreenElement ?? document.webkitFullscreenElement;

function isSupported() {
  if (typeof document === "undefined") return false;
  const el = document.documentElement;
  const hasApi = !!(el.requestFullscreen || el.webkitRequestFullscreen);
  // fullscreenEnabled is false when an iframe or policy blocks it.
  const allowed = document.fullscreenEnabled ?? document.webkitFullscreenEnabled ?? true;
  return hasApi && allowed !== false;
}

// Already launched from the home screen, so there is no browser chrome to hide.
function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

/**
 * Fullscreen toggle. iPhone Safari has no Fullscreen API at all (only video),
 * so `supported` comes back false there and the UI falls back to telling the
 * user to add the page to their home screen instead.
 */
export function useFullscreen() {
  const [active, setActive] = useState(() => !!current());
  const [supported] = useState(isSupported);
  const [standalone] = useState(isStandalone);

  useEffect(() => {
    const onChange = () => setActive(!!current());
    document.addEventListener("fullscreenchange", onChange);
    document.addEventListener("webkitfullscreenchange", onChange);
    return () => {
      document.removeEventListener("fullscreenchange", onChange);
      document.removeEventListener("webkitfullscreenchange", onChange);
    };
  }, []);

  const toggle = useCallback(async () => {
    try {
      if (current()) {
        await leave();
      } else {
        await enter(document.documentElement);
      }
    } catch {
      // Rejected when the call is not tied to a user gesture; nothing to do.
    }
  }, []);

  return { active, supported, standalone, toggle };
}
