import "dotenv/config";
import http from "http";
import express from "express";
import cors from "cors";
import coinsRoutes from "./routes/coins.routes.js";
import { attachMarketsStream } from "./ws/markets-stream.js";

const app = express();
const PORT = process.env.PORT ?? 3006;

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ message: "CryptoCoin API", coins: "/api/coins/markets" });
});

app.use("/api/coins", coinsRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  const message =
    err?.message ?? (typeof err === "string" ? err : "Internal server error");
  const isUpstream = String(message).startsWith("CoinGecko API error");
  const status = isUpstream ? 502 : 500;
  res.status(status).json({ error: message });
});

const server = http.createServer(app);
attachMarketsStream(server);

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
