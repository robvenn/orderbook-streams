const express = require("express");
const http = require("http");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const WebSocket = require("ws");

const { getPairs, createService } = require("./server/kraken");

const PORT = 9000;

/*
 * The static server for the frontend
 */
const app = express();
app.use(express.static(path.join(__dirname, "client/public")));

/*
 * The same server will also handle the incoming WebSocket connections
 */
const server = http.createServer(app);
const wss = new WebSocket.Server({ clientTracking: false, noServer: true });

const wsConnections = new Map();

/*
 * Async IIFE to initialize the application
 */
(async function() {
  const availablePairs = await getPairs();
  const kraken = createService();

  console.log({ availablePairs });

  await kraken.connect();
  // default connection "ETH/XBT"
  kraken.subscribe("ETH/XBT");
  // test ping
  kraken.ping();

  // kraken.pipe("sub", wsConnections[id]);

  server.on("upgrade", function(request, socket, head) {
    wss.handleUpgrade(request, socket, head, function(ws) {
      wss.emit("connection", ws, request);
    });
  });

  wss.on("connection", function(ws, request) {
    const connectionId = uuidv4();
    wsConnections.set(connectionId, ws);

    ws.on("message", function(message) {
      console.log(
        `Received message ${message} on WS connection ${connectionId}`
      );
    });

    ws.on("close", function() {
      wsConnections.delete(connectionId);
    });
  });

  server.listen(PORT, function() {
    console.log(`Listening on http://localhost:${PORT}`);
  });
})();
