const createOrderBookSnapshot = ({ asks = [], bids = [] }) => ({
  asks: asks.map(firstElToFloat),
  bids: bids.map(firstElToFloat)
});

const getSnapshotSlices = ({ asks, bids }, n) => ({
  asks: asks.slice(0, n),
  bids: bids.slice(0, n),
});

const firstElToFloat = row => {
  row[0] = parseFloat(row[0]);
  return row;
};

// conditions to update the orderbooks
const REMOVE = "REMOVE";
const UPDATE = "UPDATE";
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
        const askUpdateVolume = parseFloat(askUpdate[1]);
        conditionFulfilled = askUpdateVolume === 0 ? REMOVE : UPDATE;
        return true;
      } else if (askUpdatePrice < currentAskPrice) {
        conditionFulfilled = LT;
        return true;
      }
    });
    if (fulfilledAtIndex > -1) {
      updatedAsks = updatedAsks || currentAsks;
      if (conditionFulfilled === REMOVE) {
        updatedAsks.splice(fulfilledAtIndex, 1);
      } else if (conditionFulfilled === UPDATE) {
        updatedAsks[fulfilledAtIndex] = askUpdate;
      } else if (conditionFulfilled === LT) {
        updatedAsks.splice(fulfilledAtIndex, 0, askUpdate);
      }
    }
  });
  return updatedAsks;
};

module.exports = {
  createOrderBookSnapshot,
  getSnapshotSlices,
  firstElToFloat,
  updateAsks
};
