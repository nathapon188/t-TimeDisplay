import { useEffect, useState } from "react";
import { venue } from "./hours";
import { formatShift, formatTime, formatUntil, getStatus, groupDays } from "./schedule";
import { useFullscreen } from "./useFullscreen";
import { useWakeLock } from "./useWakeLock";
import "./App.css";

// Digits in the seven-segment face, am/pm in the normal one.
function Time({ value }) {
  return (
    <span className="time">
      <span className="digits">{value.digits}</span>
      <span className="suffix">{value.suffix}</span>
    </span>
  );
}

export default function App() {
  const [now, setNow] = useState(() => new Date());
  const [keepAwake, setKeepAwake] = useState(true);
  const wakeLock = useWakeLock(keepAwake);
  const fullscreen = useFullscreen();

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const status = getStatus(now);
  const today = now.getDay();
  const countdown = formatUntil(status.until, now);
  const groups = groupDays();

  return (
    <main className={status.open ? "board open" : "board closed"}>
      <header>
        <img className="logo" src={venue.logo} alt={venue.name} />
        {fullscreen.supported && !fullscreen.standalone && (
          <button
            type="button"
            className="fullscreen"
            onClick={fullscreen.toggle}
            aria-label={fullscreen.active ? "Exit full screen" : "Full screen"}
          >
            {fullscreen.active ? (
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M9 3v6H3M15 3v6h6M9 21v-6H3M15 21v-6h6" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M3 9V3h6M21 9V3h-6M3 15v6h6M21 15v6h-6" />
              </svg>
            )}
          </button>
        )}
      </header>

      <section className="status">
        <span className="badge">{status.open ? "Open now" : "Closed"}</span>
        <div className="clock">
          <Time
            value={formatTime(
              `${String(now.getHours()).padStart(2, "0")}:${String(
                now.getMinutes()
              ).padStart(2, "0")}`
            )}
          />
        </div>
        <p className="next">
          {status.until
            ? status.open
              ? `Closes in ${countdown}`
              : `Opens in ${countdown}`
            : "No trading hours set"}
        </p>
      </section>

      <ul className="week">
        {groups.map((group) => (
          <li
            key={group.label}
            className={group.days.includes(today) ? "today" : undefined}
          >
            <span className="day">{group.label}</span>
            <span className="times">
              {group.shifts.length === 0 ? (
                <span className="shift">Closed</span>
              ) : (
                group.shifts.map((shift) => {
                  const { open, close } = formatShift(shift);
                  return (
                    <span className="shift" key={shift.open}>
                      <Time value={open} />
                      <span className="dash">-</span>
                      <Time value={close} />
                    </span>
                  );
                })
              )}
            </span>
          </li>
        ))}
      </ul>

      <footer>
        <label className="awake">
          <input
            type="checkbox"
            checked={keepAwake}
            onChange={(e) => setKeepAwake(e.target.checked)}
          />
          Keep screen on
        </label>
        {!fullscreen.supported && !fullscreen.standalone && (
          <span className="hint">Add to Home Screen for full screen</span>
        )}
        <span className={`wake wake-${wakeLock}`}>
          {
            {
              active: "screen lock held",
              idle: "screen lock released",
              denied: "tap the screen to enable",
              unsupported: "needs https or a newer browser",
            }[wakeLock]
          }
        </span>
      </footer>
    </main>
  );
}
