const axios = require("axios");
const { pipeline, Transform } = require("stream");
const WebSocket = require("ws");

// const sink = require("./sink");

const API_URL = "https://api.kraken.com/0/public/AssetPairs";
const WS_URL = "wss://ws.kraken.com";

const getPairs = async () => {
  const {
    data: { result }
  } = await axios.get(API_URL);
  return Object.values(result)
    .reduce((pairs, { wsname }) => [...pairs, wsname], [])
    .filter(pair => Boolean(pair));
};

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

const createOutputStream = () => {
  return new Transform({
    objectMode: true,
    //writableObjectMode: true,
    transform(chunk, encoding, cb) {
      console.log({ chunk });
      const payload = JSON.parse(chunk);
      if (Array.isArray(payload)) {
        const { ask, asks, bid, bids, pair } = normalizePayload(payload);
        this.push({ ask, asks, bid, bids, pair });
      } else {
        const { event } = payload;
        if (event === "heartbeat") {
          console.log("[kraken] Heartbeat received");
        } else if (!["systemStatus", "subscriptionStatus"].includes(event)) {
          console.error("[kraken] Unknown update received", payload);
        }
      }
      cb();
    }
  });
};

const createSubscriptionStream = symbol => {
  return new Transform({
    // objectMode: true,
    //writableObjectMode: true,
    transform(chunk, encoding, cb) {
      console.log({ chunk });
      const { ask, asks, bid, bids, pair } = chunk;
      if (pair !== symbol) return cb();
      let data;
      if (bids && asks) {
        data = { bids, asks };
      } else {
        // These are updates, not orderbook snapshots. In a normal implementation they should update the last
        // orderbook snapshot in memory and deliver the up-to-date orderbook.
        data = { bids: bid, asks: ask };
      }
      return cb(null, JSON.stringify(data));
      // this.push(JSON.stringify({ ask, asks, bid, bids, pair }));
    }
  });
};

class Kraken {
  constructor() {
    this.pairs = [];
    this.ws = null;
    this.stream = null;
    this.output = createOutputStream();
    this.subscriptions = new Map();
  }
  async connect() {
    this.ws = new WebSocket(WS_URL);
    this.ws.onopen = () => console.log("[kraken] WS connection open");
    this.ws.onerror = err => console.error("[kraken] WS error", { err });
    this.ws.onclose = () => console.error("[kraken] WS connection closed");
    this.stream = WebSocket.createWebSocketStream(this.ws, {
      encoding: "utf8"
    });
    this.stream.pipe(this.output);
  }
  async init() {
    this.pairs = await getPairs();
    await this.connect();
  }
  // ping() {}
  subscribe(symbol) {
    console.log("Kraken subscribe to ", symbol);
    this.filteredStreams = createSubscriptionStream;
    this.stream.write(
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
  createService
};
