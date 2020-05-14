const createOrderBookSnapshot = ({ asks = [], bids = [] }) => ({
  asks: asks.slice(0, 3).map(firstElToFloat),
  bids: bids.slice(0, 3).map(firstElToFloat)
});

const firstElToFloat = row => {
  row[0] = parseFloat(row[0]);
  return row;
};

module.exports = {
  createOrderBookSnapshot,
  firstElToFloat
};
