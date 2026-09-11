import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https is here on purpose: the Screen Wake Lock API only exists in a secure
// context, so opening the dev server from a phone over plain http would never
// keep the screen on. The cert is self-signed, so accept the browser warning.
export default defineConfig({
  plugins: [react(), basicSsl()],
  server: {
    host: true, // listen on the LAN so a phone can reach it
    port: 5173,
  },
  preview: {
    host: true,
    port: 4173,
  },
})
