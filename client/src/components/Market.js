import React from "react";

import { calculateStats } from "../util/orderBook";

export default function Market(props) {
  const { asks = [], bids = [], exchangeName, pair, onRemove } = props;
  const { midPrice = "", spread = "" } = calculateStats(asks, bids);
  return (
    <li className="Market">
      <header className="Market-header">
        <h3>
          {exchangeName} {pair}
        </h3>
        <p>Speed: 53 ob/min</p>
      </header>
      <ul className="AsksList">
        {asks.map((ask, i) => {
          return (
            <li key={`${i}${ask[0]}`} className="Ask">
              <span className="AskPrice">{ask[0]}</span>
              <span className="">{ask[1]}</span>
            </li>
          );
        })}
      </ul>
      <div className="Market-highlight">
        <div className="MidPrice">{midPrice && `${midPrice} USD`}</div>
        <div className="Spread">{spread && `${spread} %`}</div>
      </div>
      <ul className="BidsList">
        {bids.map((bid, i) => {
          return (
            <li key={`${i}${bid[0]}`} className="Bid">
              <span className="BidPrice">{bid[0]}</span>
              <span className="">{bid[1]}</span>
            </li>
          );
        })}
      </ul>
      <p className="RemoveMarket" onClick={onRemove}>
        <span className="RemoveMarketButton"> &#10006; </span>
        <span className="RemoveMarketText">Click to remove market</span>
      </p>
    </li>
  );
}
