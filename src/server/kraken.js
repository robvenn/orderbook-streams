const axios = require("axios");
const WebSocket = require("ws");
const sink = require("./sink");

const API_URL = "https://api.kraken.com/0/public/AssetPairs";
const WS_URL = "wss://ws.kraken.com";

async function getPairs() {
  const {
    data: { result }
  } = await axios.get(API_URL);
  const pairs = Object.values(result).reduce(
    (pairs, { wsname }) => [...pairs, wsname],
    []
  );
  return pairs;
}

// See https://www.kraken.com/features/websocket-api#message-book for payload example
const normalizePayload = payload => {
  if (payload.length === 5) {
    const [, { a: ask }, { b: bid }, , pair] = payload;
    // ask && bid
    return { ask, bid, pair };
  }
  const [, { as: asks, bs: bids, a: ask, b: bid }, , pair] = payload;
  // ask || bid || (asks && bids)
  return { ask, bid, asks, bids, pair };
};

function subscribe({ symbol }) {
  const ws = new WebSocket(WS_URL);

  ws.onopen = function onOpen() {
    console.log("[kraken] Connection open");

    ws.send(
      JSON.stringify({
        event: "subscribe",
        pair: [symbol],
        subscription: {
          name: "book",
          depth: 100
        }
      })
    );
  };

  ws.onmessage = function onMessage({ data }) {
    const payload = JSON.parse(data);
    console.log({ payload });
    if (Array.isArray(payload)) {
      const { ask, asks, bid, bids, pair } = normalizePayload(payload);

      if (pair !== symbol) {
        throw new Error(`${pair} update received. Expected: ${symbol}`);
      }

      if (bids && asks) {
        sink.send({ bids, asks });
      } else {
        // These are updates, not orderbook snapshots. In a normal implementation they should update the last
        // orderbook snapshot in memory and deliver the up-to-date orderbook.
        sink.send({ bids: bid, asks: ask });
      }
    } else {
      const { event } = payload;
      if (event === "heartbeat") {
        console.log("[kraken] Heartbeat received");
      } else if (["systemStatus", "subscriptionStatus"].includes(event)) {
        // do nothing
      } else {
        console.error("Unknown update received", payload);
      }
    }
  };

  ws.onerror = function onError(e) {
    console.error(e);
  };

  ws.onclose = function onClose() {
    console.error("[kraken] WebSocket connection closed");
    process.exit(2);
  };
}

module.exports = {
  getPairs,
  subscribe
};
