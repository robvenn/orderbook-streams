const axios = require("axios");
const { Transform } = require("stream");
const WebSocket = require("ws");

// const sink = require("./sink");

const API_URL = "https://api.kraken.com/0/public/AssetPairs";
const WS_URL = "wss://ws.kraken.com";
const PING_INTERVAL_MS = 10000;

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

class Kraken {
  constructor() {
    this.pairs = [];
    this.createOutputStream();
    this.initWebSocket();
    this.subscriptions = new Map();
  }
  initWebSocket() {
    this.ws = new WebSocket(WS_URL);
    this.ws.onopen = () => console.log("[kraken] WS connection open");
    this.ws.onerror = err => console.error("[kraken] WS error", { err });
    this.ws.onclose = () => {
      console.error("[kraken] WS connection closed, reconnecting...");
      this.initWebSocket();
    };
    this.stream = WebSocket.createWebSocketStream(this.ws, {
      encoding: "utf8"
    });
    this.stream.pipe(this.output);
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }
    this.pingInterval = setInterval(() => {
      console.log("[kraken] Ping sent");
      this.ping();
    }, PING_INTERVAL_MS);
  }
  async init() {
    this.pairs = await getPairs();
  }
  createOutputStream() {
    this.output = new Transform({
      objectMode: true,
      transform(chunk, encoding, cb) {
        // console.log("output", { encoding });
        const payload = JSON.parse(chunk);
        if (Array.isArray(payload)) {
          const { ask, asks, bid, bids, pair } = normalizePayload(payload);
          this.push({ ask, asks, bid, bids, pair });
        } else {
          const { event } = payload;
          if (event === "heartbeat") {
            console.log("[kraken] Heartbeat received");
          } else if (event === "pong") {
            console.log("[kraken] Pong received");
          } else if (!["systemStatus", "subscriptionStatus"].includes(event)) {
            console.error("[kraken] Unknown update received", payload);
          }
        }
        cb();
      }
    });
  }
  createSubscriptionStream = (outputStream, symbol) => {
    const orderBook = {};
    console.log("create sub", { symbol });
    const transform = new Transform({
      // objectMode: true,
      readableObjectMode: false,
      writableObjectMode: true,
      transform(chunk, encoding, cb) {
        // console.log("sub stream for " + symbol, { chunk });
        const { ask, asks, bid, bids, pair } = chunk;
        if (pair !== symbol) return cb();
        const data = { pair, exchange: "kraken" };
        if (bids && asks) {
          data.bids = bids;
          data.asks = asks;
        } else {
          // These are updates, not orderbook snapshots. In a normal implementation they should update the last
          // orderbook snapshot in memory and deliver the up-to-date orderbook.
          data.bids = bid;
          data.asks = ask;
          return cb();
        }
        return cb(null, JSON.stringify(data));
      }
    });
    return outputStream.pipe(transform);
  };
  ping() {
    this.ws.send(
      JSON.stringify({
        event: "ping"
      })
    );
  }
  subscribe(stream, pair) {
    console.log("[kraken] subscribe to ", pair);
    let subscription;
    if (this.subscriptions.has(pair)) {
      subscription = this.subscriptions.get(pair);
      subscription.subscribers.add(stream);
    } else {
      this.stream.write(
        JSON.stringify({
          event: "subscribe",
          pair: [pair],
          subscription: {
            name: "book",
            depth: 100
          }
        })
      );
      const subscriptionStream = this.createSubscriptionStream(
        this.output,
        pair
      );
      subscription = {
        orderBook: {},
        stream: subscriptionStream,
        subscribers: new Set([stream])
      };
      this.subscriptions.set(pair, subscription);
    }
    subscription.stream.pipe(stream);
    console.log(
      `[kraken] New subscriber to ${pair}, number of subscibers: ${subscription.subscribers.size}`
    );
  }
  unsubscribe(stream, pair) {
    if (!this.subscriptions.has(pair)) {
      throw new Error("[kraken] Subscription not found, " + pair);
    }
    const subscription = this.subscriptions.get(pair);
    subscription.stream.unpipe(stream);
    subscription.subscribers.delete(stream);
    console.log(
      `[kraken] Removed subscription to ${pair}, number of subscribers is now ${subscription.subscribers.size}`
    );
    if (subscription.subscribers.size <= 0) {
      this.stream.write(
        JSON.stringify({
          event: "unsubscribe",
          pair: [pair],
          subscription: {
            name: "book",
            depth: 100
          }
        })
      );
      this.subscriptions.delete(pair);
      console.log(
        `[kraken] No more subscribers for ${pair}, removed subscription`
      );
    }
  }
}

function createService() {
  return new Kraken();
}

module.exports = {
  createService
};
