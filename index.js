const express = require("express");
const http = require("http");
const path = require("path");

const { initWebSocketServer } = require("./server/main");

const PORT = 9000;

/*
 * The static server for the frontend
 */
const app = express();
app.use(express.static(path.join(__dirname, "client/build")));

/*
 * The same server will also handle the incoming WebSocket connections
 */
const server = http.createServer(app);

/*
 * Async IIFE to initialize the application
 */
(async function() {
  try {
    const wss = await initWebSocketServer();
    server.on("upgrade", function(request, socket, head) {
      wss.handleUpgrade(request, socket, head, function(ws) {
        wss.emit("connection", ws, request);
      });
    });
    server.listen(PORT, function() {
      console.log(`Listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Error initializing server, ", err);
    process.exitCode = 1;
  }
})();
