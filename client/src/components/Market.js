import React from "react";

export default function Market() {
  return (
    <div className="Market">
      <header className="Market-header">
        <h3>Kraken BTC/USD</h3>
        <p>Speed: 53 ob/min</p>
      </header>
      <ul className="AsksList">
        <li className="Ask">
          <span className="AskPrice">7107.3</span>
          <span className="">25.0</span>
        </li>
        <li className="Ask">
          <span className="AskPrice">7107.3</span>
          <span className="">25.0</span>
        </li>
        <li className="Ask">
          <span className="AskPrice">7107.3</span>
          <span className="">25.0</span>
        </li>
      </ul>
      <div className="Market-highlight">
        <div className="MidPrice">7142.5 USD</div>
        <div className="Spread">0.03%</div>
      </div>
      <ul className="BidsList">
        <li className="Bid">
          <span className="BidPrice">7104.8</span>
          <span className="">22.1</span>
        </li>
        <li className="Bid">
          <span className="BidPrice">7104.8</span>
          <span className="">22.1</span>
        </li>
        <li className="Bid">
          <span className="BidPrice">7104.8</span>
          <span className="">22.1</span>
        </li>
      </ul>
    </div>
  );
}
