# Minecraft AFK Bot

A configurable Mineflayer bot with reconnect handling and a tiny HTTP health endpoint.

## Environment variables

Set these in your hosting provider's environment settings (do not commit passwords or tokens):

- `MC_HOST` — Minecraft server hostname
- `MC_PORT` — server port (defaults to `25565`)
- `MC_USERNAME` — bot account name / Microsoft account email depending on auth mode
- `MC_AUTH` — defaults to `microsoft`; use only an account you own and are allowed to use
- `MC_VERSION` — optional Minecraft protocol version; leave unset for auto-detection
- `RECONNECT_MS` — reconnect delay in milliseconds (defaults to `15000`)
- `PORT` — HTTP health endpoint port, normally supplied by the host

## Run locally

```bash
npm install
npm start
```

For Microsoft authentication, follow the device-code instructions shown in the service logs when prompted. The host may need persistent storage for the authentication cache; if it cannot retain that cache, sign-in may need to be repeated.

## Health endpoints

- `/` — JSON status and configured server
- `/health` — health check

## Important

- Ask the Minecraft server owner/admin whether automated bots are allowed. Some servers kick or ban AFK bots.
- GitHub stores the source code; it does not keep this process running 24/7.
- Free hosting tiers may sleep, restart, or have usage limits. Continuous uptime requires a host plan that permits a persistent process.
