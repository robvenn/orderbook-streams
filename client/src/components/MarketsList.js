import React from "react";
import Market from "./Market";

export default function MarketsList(props) {
  const markets = [{ item: "one" }];
  return (
    <ul className="MarketsList">
      {markets.map(market => (
        <Market {...market} />
      ))}
      <li className="NewMarketPlaceholder">
        <p>Click to add a new market</p>
      </li>
    </ul>
  );
}
