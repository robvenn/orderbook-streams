import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import MarketsList from "./components/MarketsList";
import "./App.css";

const STATUS = {
  INITIALIZING: "INITIALIZING",
  CONNECTED: "CONNECTED",
  RECONNECTING: "RECONNECTING"
};
const WS_URL = "ws://localhost:9000";

const ws = new WebSocket(WS_URL);
Modal.setAppElement("#root");

// if (!ws || ws.readyState == WebSocket.CLOSED) this.connect();

function App() {
  const [status, setStatus] = useState(STATUS.INITIALIZING);
  const [exchanges, setExchanges] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [modalIsOpen, setIsOpen] = React.useState(false);
  const closeModal = () => setIsOpen(false);
  const openModal = () => setIsOpen(true);
  const onAddMarket = ({ exchangeId, pair }) => {
    console.log("onAddMarket", { exchangeId, pair });
    /*const market = {
      exchange: "",
      pair: "",
      asks: [],
      bids: [],
      midPrice: null,
      spread: null
    };*/
    //setSubscriptions([...subscriptions, market]);
    ws.send(
      JSON.stringify({
        action: "subscribe",
        exchangeId,
        pair
      })
    );
  };
  useEffect(() => {
    ws.onopen = () => {
      setStatus(STATUS.CONNECTED);
    };
    ws.onmessage = evt => {
      const msg = JSON.parse(evt.data);
      console.log("message:", msg);
      if (msg.exchanges) {
        setExchanges(msg.exchanges);
      }
    };
    ws.onclose = () => {
      setStatus(STATUS.RECONNECTING);
      console.log("ws closed");
    };
    ws.onerror = () => console.log("ws error");
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
      {status === STATUS.INITIALIZING ? (
        <p>Connecting to server...</p>
      ) : (
        <MarketsList
          exchanges={exchanges}
          online={status === STATUS.CONNECTED}
          markets={subscriptions}
          browseAvailableMarkets={openModal}
        />
      )}
      <Modal
        className="AddMarketModal"
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Add market"
      >
        <h2>Add market</h2>
        <p>Select which market you want to track</p>
        <ul className="AddMarketsList">
          {exchanges.map(({ id: exchangeId, name: exchangeName, pairs }) => {
            return pairs.map(pair => (
              <li
                className="AddMarketsListItem"
                key={`${exchangeId}.${pair}`}
                onClick={() => onAddMarket({ exchangeId, pair })}
              >
                &#43; {exchangeName}: {pair}
              </li>
            ));
          })}
        </ul>
        <div>
          <button className="button-cancel" onClick={closeModal}>
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default App;
