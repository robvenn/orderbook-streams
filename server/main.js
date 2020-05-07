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

  wss.on("connection", function(ws, request) {
    const connectionId = uuidv4();
    const stream = WebSocket.createWebSocketStream(ws, {
      encoding: "utf8"
    });
    wsConnections.set(connectionId, stream);
    console.log("new ws connection ", connectionId);
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
        // this could contain one or more active subscriptions by default
        // subscriptions: []
      })
    );

    // kraken.pipe("sub", wsConnections[id]);
    // kraken.output.pipe(stream);

    ws.on("open", function(message) {
      console.log("ws connection open", { message });
    });

    ws.on("message", function(message) {
      console.log(
        `Received message ${message} on WS connection ${connectionId}`
      );
    });

    ws.on("close", function() {
      console.log(`WS connection lost, connectionId=${connectionId}`);
      wsConnections.delete(connectionId);
    });
  });

  return wss;
}

module.exports = {
  initWebSocketServer
};
