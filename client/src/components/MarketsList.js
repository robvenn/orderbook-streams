import React, { useState } from "react";
import Market from "./Market";

export default function MarketsList(props) {
  const { browseAvailableMarkets, markets, online } = props;
  // const [markets, setMarkets] = useState([]);
  console.log({
    markets
  });
  return (
    <ul className="MarketsList">
      {markets.map(market => (
        <Market key={`${market.exchange}.${market.pair}`} {...market} />
      ))}
      {online ? (
        <li className="NewMarketPlaceholder" onClick={browseAvailableMarkets}>
          <span className="AddMarketButton"> &#43; </span>
          <p>Click to add a new market</p>
        </li>
      ) : (
        <p>Connecting to server...</p>
      )}
    </ul>
  );
}
