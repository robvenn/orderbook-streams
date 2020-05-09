import React from "react";

export default function Market(props) {
  const {
    asks = [],
    bids = [],
    exchangeName,
    pair,
    midPrice,
    spread,
    onRemove
  } = props;
  return (
    <li className="Market">
      <header className="Market-header">
        <h3>
          {exchangeName} {pair}
        </h3>
        <p>Speed: 53 ob/min</p>
      </header>
      <ul className="AsksList">
        {asks.map(ask => {
          return (
            <li key={ask[0] + ask[1]} className="Ask">
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
        {bids.map(bid => {
          return (
            <li key={bid[0] + bid[1]} className="Bid">
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
