import {
  COINGECKO_BASE_URL,
  COINS_MARKETS_PATH,
  DEFAULT_MARKET_PARAMS,
} from "../config/constants.js";

function buildUrl(base, params) {
  const search = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)]),
  ).toString();
  return search ? `${base}?${search}` : base;
}

export async function getCoinsMarkets(options = {}) {
  const params = { ...DEFAULT_MARKET_PARAMS, ...options };
  const apiKey = process.env.COINGECKO_API_KEY;
  if (apiKey) {
    params.x_cg_demo_api_key = apiKey;
  }
  const url = buildUrl(`${COINGECKO_BASE_URL}${COINS_MARKETS_PATH}`, params);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `CoinGecko API error: ${response.status} ${response.statusText}. ${text || ""}`,
    );
  }

  let data;
  try {
    data = await response.json();
  } catch (e) {
    throw new Error(`CoinGecko API error: invalid JSON. ${e.message ?? ""}`);
  }
  if (!Array.isArray(data)) {
    const msg = data?.error ?? data?.message ?? "Unexpected response format";
    throw new Error(`CoinGecko API error: ${msg}`);
  }

  return data;
}
