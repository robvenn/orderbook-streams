import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { parseBlob } from "./util/fileReader";
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
  const [modalIsOpen, setIsOpen] = React.useState(false);
  const [exchanges, setExchanges] = useState([]);
  const [subscriptions, setSubscriptions] = useState({});

  const closeModal = () => setIsOpen(false);
  const openModal = () => setIsOpen(true);
  const onAddSubscription = (marketId, market) => {
    const { exchangeId, pair } = market;
    console.log("onAddMarket", { exchangeId, pair });
    const subscription = {
      ...market,
      asks: [],
      bids: [],
      midPrice: null,
      spread: null
    };
    setSubscriptions({ ...subscriptions, [marketId]: subscription });
    closeModal();
    ws.send(
      JSON.stringify({
        action: "subscribe",
        exchangeId,
        pair
      })
    );
  };

  const availableMarkets = exchanges.reduce((markets, exchange) => {
    const { id: exchangeId, name: exchangeName, pairs } = exchange;
    return {
      ...markets,
      ...pairs
        .filter(pair => !subscriptions.hasOwnProperty(`${exchangeId}.${pair}`))
        .map(pair => ({ exchangeId, exchangeName, pair }))
        .reduce(
          (pairs, market) => ({
            ...pairs,
            [`${exchangeId}.${market.pair}`]: market
          }),
          {}
        )
    };
  }, {});

  console.log({ availableMarkets });
  useEffect(() => {
    ws.onopen = () => {
      setStatus(STATUS.CONNECTED);
    };
    ws.onmessage = async evt => {
      let data;
      try {
        if (evt.data instanceof Blob) {
          data = await parseBlob(evt.data);
        } else {
          data = JSON.parse(evt.data);
        }
      } catch (err) {
        console.error("failed parsing message: ", evt.data);
      }
      console.log("message:", data);
      if (data?.exchanges) {
        setExchanges(data.exchanges);
      }
      if (data?.pair) {
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
          markets={Object.values(subscriptions)}
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
        <p>
          Select which market you want to track (available:{" "}
          {Object.keys(availableMarkets).length})
        </p>
        <ul className="AddMarketsList">
          {Object.entries(availableMarkets).map(([marketId, market]) => {
            const { exchangeName, pair } = market;
            //console.log({ marketId, market });
            return (
              <li
                className="AddMarketsListItem"
                key={marketId}
                onClick={() => onAddSubscription(marketId, market)}
              >
                &#43; {exchangeName}: {pair}
              </li>
            );
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
