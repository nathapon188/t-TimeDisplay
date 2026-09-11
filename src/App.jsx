import { useEffect, useState } from "react";
import { venue } from "./hours";
import { formatShift, formatUntil, getStatus, groupDays } from "./schedule";
import { useWakeLock } from "./useWakeLock";
import "./App.css";

export default function App() {
  const [now, setNow] = useState(() => new Date());
  const [keepAwake, setKeepAwake] = useState(true);
  const wakeLock = useWakeLock(keepAwake);

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
      </header>

      <section className="status">
        <span className="badge">{status.open ? "Open now" : "Closed"}</span>
        <div className="clock">
          {now.toLocaleTimeString("en-AU", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })}
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
                group.shifts.map((shift) => (
                  <span className="shift" key={shift.open}>
                    {formatShift(shift)}
                  </span>
                ))
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
