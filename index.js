const mineflayer = require('mineflayer');
const express = require('express');

const app = express();
const PORT = Number(process.env.PORT || 3000);

let bot = null;
let status = 'starting';
let lastError = null;
let reconnectTimer = null;
let stopping = false;

app.get('/', (_req, res) => {
  res.json({
    name: 'Minecraft AFK Bot',
    status,
    server: process.env.MC_HOST ? `${process.env.MC_HOST}:${process.env.MC_PORT || 25565}` : 'not configured',
    lastError
  });
});
app.get('/health', (_req, res) => {
  res.status(status === 'online' || status === 'connecting' ? 200 : 503).json({ status });
});
app.listen(PORT, '0.0.0.0', () => console.log(`Health endpoint listening on ${PORT}`));

function connect() {
  if (stopping) return;
  const host = process.env.MC_HOST;
  const username = process.env.MC_USERNAME;
  const port = Number(process.env.MC_PORT || 25565);

  if (!host || !username) {
    status = 'needs_config';
    console.error('Set MC_HOST and MC_USERNAME in your hosting environment variables.');
    return;
  }

  status = 'connecting';
  lastError = null;
  console.log(`Connecting to ${host}:${port} as ${username}`);

  try {
    bot = mineflayer.createBot({
      host,
      port,
      username,
      auth: process.env.MC_AUTH || 'microsoft',
      version: process.env.MC_VERSION || false,
      hideErrors: false
    });

    bot.once('login', () => {
      status = 'online';
      console.log('Minecraft bot logged in.');
    });

    bot.on('spawn', () => {
      status = 'online';
      console.log('Bot spawned in the world.');
    });

    bot.on('kicked', (reason) => {
      lastError = String(reason);
      console.warn('Bot kicked:', lastError);
    });

    bot.on('error', (err) => {
      lastError = err.message || String(err);
      console.error('Minecraft error:', lastError);
    });

    bot.once('end', (reason) => {
      console.log('Connection ended:', reason || 'unknown reason');
      bot = null;
      status = 'offline';
      if (!stopping) {
        clearTimeout(reconnectTimer);
        reconnectTimer = setTimeout(connect, Number(process.env.RECONNECT_MS || 15000));
      }
    });
  } catch (err) {
    lastError = err.message || String(err);
    status = 'offline';
    console.error('Could not create bot:', lastError);
    reconnectTimer = setTimeout(connect, Number(process.env.RECONNECT_MS || 15000));
  }
}

process.on('SIGTERM', () => {
  stopping = true;
  clearTimeout(reconnectTimer);
  if (bot) bot.quit('Service stopping');
  process.exit(0);
});
process.on('SIGINT', () => {
  stopping = true;
  clearTimeout(reconnectTimer);
  if (bot) bot.quit('Service stopping');
  process.exit(0);
});

connect();
