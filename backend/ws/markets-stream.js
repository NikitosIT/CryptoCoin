import { WebSocketServer } from "ws";
import { getCoinsMarkets } from "../services/coingecko.service.js";

const BROADCAST_INTERVAL_MS = 5 * 1000;

export function attachMarketsStream(server) {
  const wss = new WebSocketServer({ server, path: "/ws/markets" });

  let lastPayload = null;

  async function fetchAndBroadcast() {
    try {
      const data = await getCoinsMarkets();
      lastPayload = JSON.stringify(data);
      const open = [...wss.clients].filter((c) => c.readyState === 1);
      open.forEach((client) => {
        try {
          client.send(lastPayload);
        } catch (e) {
          console.warn("WS send error:", e.message);
        }
      });
    } catch (err) {
      console.error("Markets stream fetch error:", err.message);
    }
  }

  const intervalId = setInterval(fetchAndBroadcast, BROADCAST_INTERVAL_MS);
  fetchAndBroadcast();

  wss.on("connection", (ws) => {
    if (lastPayload) {
      try {
        ws.send(lastPayload);
      } catch (e) {
        console.warn("WS send error:", e.message);
      }
    }
  });

  wss.on("close", () => {
    clearInterval(intervalId);
  });

  return wss;
}
