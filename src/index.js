const WebSocket = require("ws");
const sink = require("./sink");

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

function Kraken({ symbol }) {
  const ws = new WebSocket("wss://ws.kraken.com");

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

const exchange = Kraken({ symbol: "ETH/XBT" });
