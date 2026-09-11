# Tamrab Thai - Opening Hours display

A single-screen React board for a phone or tablet mounted at the door: the logo,
an open/closed badge, a live clock with a countdown to the next open/close, and
the trading hours in large type.

## Edit the hours

Everything is in `src/hours.js` - venue name, logo path, and the weekly table.
A close time earlier than the open time means the shift runs past midnight
(e.g. `{ open: "18:00", close: "01:00" }`). An empty array means closed.

Consecutive days with identical hours are collapsed into one row automatically,
so Mon-Fri shows as a single `Mon - Fri` block. Give a day different hours and it
splits out on its own.

## Run it

    npm install
    npm run dev

The dev server listens on the LAN over **https** (self-signed cert), which is
required for the keep-awake feature.

## Showing it on a phone

1. Make sure the phone is on the same Wi-Fi as this machine.
2. Run `npm run dev` and open the `Network:` URL it prints, e.g.
   `https://192.168.1.42:5173`.
3. Accept the self-signed certificate warning once.
4. Add to home screen (Safari: Share > Add to Home Screen; Chrome: menu > Add to
   Home screen) and launch it from there so it runs full screen without the
   browser chrome.

### Full screen

A button in the top right corner toggles full screen via the Fullscreen API.
iPhone Safari does not implement that API at all (only for video), so on an
iPhone the button is hidden and the footer suggests Add to Home Screen instead,
which is the only way to lose the browser chrome there. The button also hides
itself once the page is already running from the home screen.

### Keeping the screen on

The app holds a Screen Wake Lock while the "Keep screen on" box is ticked, so
the phone will not dim or sleep while the board is showing. Notes:

- It needs https or localhost. Over plain http the API does not exist and the
  footer will say "needs https or a newer browser".
- Supported on iOS 16.4+ Safari and Chrome for Android. If the footer says
  "tap the screen to enable", tap once - some browsers only grant the lock
  after a user gesture.
- The lock is released automatically when the page is hidden and re-acquired
  when it becomes visible again.
- The wake lock does not override a low-power mode, and iOS still releases it
  if you manually lock the phone. For a permanent wall display also set the
  phone's Auto-Lock to Never (iOS: Settings > Display & Brightness > Auto-Lock;
  Android: Settings > Display > Screen timeout) and keep it on the charger.

## Build

    npm run build
    npm run preview
