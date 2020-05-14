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

function App() {
  const [status, setStatus] = useState(STATUS.INITIALIZING);
  const [modalIsOpen, setIsOpen] = React.useState(false);
  const [exchanges, setExchanges] = useState([]);
  const [subscriptions, setSubscriptions] = useState({});

  const closeModal = () => setIsOpen(false);
  const openModal = () => setIsOpen(true);
  const onAddSubscription = (marketId, market) => {
    const { exchangeId, pair } = market;
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
  const onRemoveSubscription = marketId => {
    const {
      [marketId]: marketToRemove,
      ...updatedSubscriptions
    } = subscriptions;
    const { exchangeId, pair } = marketToRemove;
    ws.send(
      JSON.stringify({
        action: "unsubscribe",
        exchangeId,
        pair
      })
    );
    setSubscriptions(updatedSubscriptions);
  };

  const availableMarkets = exchanges.reduce((markets, exchange) => {
    const { id: exchangeId, name: exchangeName, pairs } = exchange;
    return {
      ...markets,
      ...pairs
        .filter(pair => !subscriptions.hasOwnProperty(`${exchangeId}.${pair}`))
        .map(pair => ({
          id: `${exchangeId}.${pair}`,
          exchangeId,
          exchangeName,
          pair
        }))
        .reduce(
          (pairs, market) => ({
            ...pairs,
            [market.id]: market
          }),
          {}
        )
    };
  }, {});

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
      console.log("message:", JSON.stringify(data));
      if (data?.exchanges) {
        setExchanges(data.exchanges);
      }
      if (data?.exchange && data?.pair) {
        const { exchange, pair, snapshot } = data;
        const subscriptionId = `${exchange}.${pair}`;
        if (!subscriptions.hasOwnProperty(subscriptionId)) {
          console.error(
            `Got message for unknown subscription: exchangeId=${exchange} pair=${pair}`
          );
          return;
        }
        const subscription = subscriptions[subscriptionId];
        let updateSubscription;

        if (snapshot) {
          const { asks, bids } = snapshot;
          updateSubscription = {
            ...subscription,
            asks: asks.reverse(),
            bids
          };
        }

        if (updateSubscription) {
          const bestAskPrice = updateSubscription.asks[2][0];
          const bestBidPrice = updateSubscription.bids[0][0];
          const midPrice = (bestAskPrice + bestBidPrice) / 2;
          const spread = (bestAskPrice - bestBidPrice) / midPrice;
          console.log({
            updateSubscription,
            subscriptionId,
            midPrice,
            spread
          });
          setSubscriptions({
            ...subscriptions,
            [subscriptionId]: {
              ...updateSubscription,
              midPrice,
              spread
            }
          });
        }
      }
    };
    ws.onclose = () => {
      setStatus(STATUS.RECONNECTING);
      console.error("ws closed");
    };
    ws.onerror = () => console.error("ws error");
  }, [subscriptions]);

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
          removeMarket={onRemoveSubscription}
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
