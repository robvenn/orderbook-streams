const axios = require("axios");
const WebSocket = require("ws");
const sink = require("./sink");

const API_URL = "https://api.kraken.com/0/public/AssetPairs";
const WS_URL = "wss://ws.kraken.com";

const symbol = "ETH/XBT";

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

class Kraken {
  constructor() {
    this.ws = null;
    this.subscriptions = [];
  }
  async connect() {
    this.ws = new WebSocket(WS_URL);
    this.ws.onopen = () => console.log("[kraken] Connection open");
    this.ws.onerror = err => console.error("[kraken] error", { err });
    this.ws.onclose = () =>
      console.error("[kraken] WebSocket connection closed");
    this.connection = WebSocket.createWebSocketStream(this.ws, {
      encoding: "utf8"
    });
    this.connection.on("data", chunk => {
      console.log({ chunk });
      const payload = JSON.parse(chunk);
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
        } else if (!["systemStatus", "subscriptionStatus"].includes(event)) {
          console.error("Unknown update received", payload);
        }
      }
    });
  }
  ping() {}
  subscribe(symbol) {
    console.log("Kraken subscribe to ", symbol);
    this.connection.write(
      JSON.stringify({
        event: "subscribe",
        pair: [symbol],
        subscription: {
          name: "book",
          depth: 100
        }
      })
    );
  }
  unsubscribe() {}
}

function createService() {
  return new Kraken();
}

module.exports = {
  createService,
  getPairs
};
