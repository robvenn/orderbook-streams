const createOrderBookSnapshot = ({ asks = [], bids = [] }) => ({
  asks: asks.slice(0, 3).map(firstElToFloat),
  bids: bids.slice(0, 3).map(firstElToFloat)
});

const firstElToFloat = row => {
  row[0] = parseFloat(row[0]);
  return row;
};

// comparator conditions for updating the orderbooks
const EQUALS = "EQUALS";
const LT = "LT";
const GT = "GT";

const updateAsks = (currentAsks, askUpdates) => {
  let updatedAsks;
  askUpdates.forEach(askUpdate => {
    const askUpdatePrice = parseFloat(askUpdate[0]);
    askUpdate[0] = askUpdatePrice;
    let conditionFulfilled;
    const fulfilledAtIndex = currentAsks.findIndex(currentAsk => {
      const currentAskPrice = currentAsk[0];
      if (askUpdatePrice === currentAskPrice) {
        conditionFulfilled = EQUALS;
        return true;
      } else if (askUpdatePrice < currentAskPrice) {
        conditionFulfilled = LT;
        return true;
      }
    });
    if (fulfilledAtIndex > -1) {
      updatedAsks = updatedAsks || currentAsks;
      if (conditionFulfilled === EQUALS) {
        updatedAsks[fulfilledAtIndex] = askUpdate;
      } else if (conditionFulfilled === LT) {
        updatedAsks.splice(fulfilledAtIndex, 0, askUpdate);
        updatedAsks.pop();
      }
    }
  });
  return updatedAsks;
};

module.exports = {
  createOrderBookSnapshot,
  firstElToFloat,
  updateAsks
};
