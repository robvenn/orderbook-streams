import React from "react";
import Market from "./Market";

export default function MarketsList(props) {
  const { browseAvailableMarkets, markets, online, removeMarket } = props;
  return (
    <ul className="MarketsList">
      {markets.map(market => (
        <Market
          key={market.id}
          onRemove={() => removeMarket(market.id)}
          {...market}
        />
      ))}
      {online ? (
        <li className="NewMarketPlaceholder" onClick={browseAvailableMarkets}>
          <span className="AddMarketButton"> &#43; </span>
          <p>Click to add a new market</p>
        </li>
      ) : (
        <li className="ConnectingPlaceholder">Connecting to server...</li>
      )}
    </ul>
  );
}
