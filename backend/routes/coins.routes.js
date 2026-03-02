import { Router } from "express";
import { getCoinsMarkets } from "../services/coingecko.service.js";

const router = Router();

router.get("/markets", async (req, res, next) => {
  try {
    const { vs_currency, order, per_page, page, sparkline } = req.query;
    const options = {};
    if (vs_currency != null) options.vs_currency = vs_currency;
    if (order != null) options.order = order;
    if (per_page != null) options.per_page = Number(per_page) || 100;
    if (page != null) options.page = Number(page) || 1;
    if (sparkline != null) options.sparkline = sparkline === "true";

    const data = await getCoinsMarkets(options);
    res.json(data);
  } catch (err) {
    const msg = err?.message ?? String(err);
    const normalized =
      msg.startsWith("CoinGecko API error") ? err : new Error(`CoinGecko API error: ${msg}`);
    next(normalized);
  }
});

export default router;
