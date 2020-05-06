import React, { useEffect, useState } from "react";
import MarketsList from "./components/MarketsList";
import "./App.css";

const STATUS = {
  INITIALIZING: "INITIALIZING",
  CONNECTED: "CONNECTED",
  RECONNECTING: "RECONNECTING"
};

function App() {
  const status = useState(STATUS.INITIALIZING);
  const ws = new WebSocket("ws://localhost:9000");
  useEffect(() => {
    console.log("effect");
    ws.onopen = () => console.log("ws connected");
    ws.onmessage = evt => console.log("message:", evt.data);
    // ws.send("hello");
  }, [ws]);

  return (
    <div className="App">
      <div className="StatusBar">
        Status:
        <span
          className={`status ${
            status === STATUS.RECONNECTING ? "status-error" : "status-ok"
          }`}
        >
          {status}
        </span>
      </div>
      <header className="App-header">
        <h1>Orderbooks</h1>
      </header>
      <MarketsList />
    </div>
  );
}

export default App;
