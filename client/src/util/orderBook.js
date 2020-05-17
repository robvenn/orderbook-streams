const DECIMAL_NUMBER = 7;

export const calculateStats = (asks, bids) => {
  if (!asks.length || !bids.length) return {};
  const bestAskPrice = asks[0][0];
  const bestBidPrice = bids[0][0];
  const midPrice = ((bestAskPrice + bestBidPrice) / 2).toFixed(DECIMAL_NUMBER);
  const spread = ((bestAskPrice - bestBidPrice) / midPrice).toFixed(
    DECIMAL_NUMBER
  );
  return { midPrice, spread };
};
