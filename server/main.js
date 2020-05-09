const { v4: uuidv4 } = require("uuid");
const WebSocket = require("ws");

const { createService } = require("./kraken");

async function initWebSocketServer() {
  const wsConnections = new Map();
  const wss = new WebSocket.Server({ clientTracking: false, noServer: true });

  // this could be extended to support multiple exchanges
  const kraken = createService();
  await kraken.init();

  // test ping
  // kraken.ping();

  wss.on("connection", function(ws) {
    const connectionId = uuidv4();
    const stream = WebSocket.createWebSocketStream(ws, {
      encoding: "utf8",
      binary: false
    });
    const subscriptions = new Map();
    wsConnections.set(connectionId, {
      stream,
      ws,
      subscriptions
    });
    console.log("[WSS] New ws connection ", connectionId);
    // send a message to the new client with some info so they know which exchanges and pairs are available
    ws.send(
      JSON.stringify({
        connectionId,
        exchanges: [
          {
            id: "kraken",
            name: "Kraken",
            pairs: kraken.pairs
          }
        ]
      })
    );

    ws.on("message", function(message) {
      console.log(
        `[WSS] Received message ${message} on WS connection ${connectionId}`
      );
      const { action, ...payload } = JSON.parse(message);
      if (action === "subscribe") {
        const { exchangeId, pair } = payload;
        if (exchangeId !== "kraken") {
          ws.send(
            JSON.stringify({
              success: false,
              error: "Unknown exchangeId"
            })
          );
        } else if (subscriptions.has(pair)) {
          ws.send(
            JSON.stringify({
              success: false,
              error: "Already subscribed to " + pair
            })
          );
        } else {
          kraken.subscribe(stream, pair);
          /*ws.send(
            JSON.stringify({
              success: true,
              message: `Subscribed to ${exchangeId} ${pair}`
            })
          );*/
        }
      } else if (action === "unsubscribe") {
        const { exchangeId, pair } = payload;
        if (exchangeId !== "kraken") {
          ws.send(
            JSON.stringify({
              success: false,
              error: "Unknown exchangeId"
            })
          );
        } else if (!subscriptions.has(pair)) {
          ws.send(
            JSON.stringify({
              success: false,
              error: "No active subscription to" + pair
            })
          );
        }
      }
    });

    ws.on("close", function() {
      console.log(`WS connection lost, connectionId=${connectionId}`);
      subscriptions.forEach(([subscription, pair]) => {
        kraken.unsubscribe(pair, subscription);
      });
      wsConnections.delete(connectionId);
    });
  });

  return wss;
}

module.exports = {
  initWebSocketServer
};
