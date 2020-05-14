const { v4: uuidv4 } = require("uuid");
const WebSocket = require("ws");

const { createService } = require("./kraken");

const createMessageSender = ws => {
  const message = msg => ws.send(JSON.stringify(msg));
  const success = msg => message({ success: true, message: msg });
  const error = msg => message({ success: false, error: msg });
  return {
    error,
    message,
    success
  };
};

async function initWebSocketServer() {
  const wsConnections = new Map();
  const wss = new WebSocket.Server({ clientTracking: false, noServer: true });

  // this could be extended to support multiple exchanges
  const kraken = createService();
  await kraken.init();

  wss.on("connection", function(ws) {
    const connectionId = uuidv4();
    const { message, success, error } = createMessageSender(ws);
    const stream = WebSocket.createWebSocketStream(ws, {
      encoding: "utf8"
    });
    const subscriptions = new Set();
    wsConnections.set(connectionId, {
      stream,
      ws,
      subscriptions
    });
    console.log("[WSS] New ws connection ", connectionId);
    // send a message to the new client with some info about available exchanges and pairs
    message({
      connectionId,
      exchanges: [
        {
          id: "kraken",
          name: "Kraken",
          pairs: kraken.pairs
        }
      ]
    });

    ws.on("message", function(message) {
      console.log(
        `[WSS] Received message ${message} on WS connection ${connectionId}`
      );
      const { action, ...payload } = JSON.parse(message);
      if (action === "subscribe") {
        const { exchangeId, pair } = payload;
        if (exchangeId !== "kraken") {
          error("Unknown exchangeId");
        } else if (subscriptions.has(pair)) {
          error(`Already subscribed to ${pair}`);
        } else {
          kraken.subscribe(stream, pair);
          subscriptions.add(pair);
          success(`Subscribed to ${exchangeId} ${pair}`);
        }
      } else if (action === "unsubscribe") {
        const { exchangeId, pair } = payload;
        if (exchangeId !== "kraken") {
          error("Unknown exchangeId");
        } else if (!subscriptions.has(pair)) {
          error(`No active subscription to ${pair}`);
        }
        kraken.unsubscribe(stream, pair);
        subscriptions.delete(pair);
      }
    });

    ws.on("close", function() {
      console.log(`[WSS]  connection lost, connectionId=${connectionId}`);
      subscriptions.forEach((subscription, pair) => {
        kraken.unsubscribe(subscription, pair);
      });
      wsConnections.delete(connectionId);
    });
  });

  return wss;
}

module.exports = {
  initWebSocketServer
};
