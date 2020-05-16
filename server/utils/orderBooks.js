const createOrderBookSnapshot = ({ asks = [], bids = [] }) => ({
  asks: asks.map(firstElToFloat),
  bids: bids.map(firstElToFloat)
});

const getSnapshotSlices = ({ asks, bids }, n) => ({
  asks: asks.slice(0, n),
  bids: bids.slice(0, n)
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

const updateOrderBookList = comparator => (currentList, newList) => {
  let updatedList;
  newList.forEach(newRow => {
    const newRowPrice = parseFloat(newRow[0]);
    newRow[0] = newRowPrice;
    let conditionFulfilled;
    const fulfilledAtIndex = currentList.findIndex(currentRow => {
      const currentRowPrice = currentRow[0];
      if (newRowPrice === currentRowPrice) {
        const askUpdateVolume = parseFloat(newRow[1]);
        conditionFulfilled = askUpdateVolume === 0 ? REMOVE : UPDATE;
        return true;
      } else if (
        (comparator === LT && newRowPrice < currentRowPrice) ||
        (comparator === GT && newRowPrice > currentRowPrice)
      ) {
        conditionFulfilled = comparator;
        return true;
      }
    });
    if (fulfilledAtIndex > -1) {
      updatedList = updatedList || currentList;
      if (conditionFulfilled === REMOVE) {
        updatedList.splice(fulfilledAtIndex, 1);
      } else if (conditionFulfilled === UPDATE) {
        updatedList[fulfilledAtIndex] = newRow;
      } else if (conditionFulfilled === comparator) {
        updatedList.splice(fulfilledAtIndex, 0, newRow);
      }
    }
  });
  return updatedList;
};

const updateAsks = updateOrderBookList(LT);

const updateBids = updateOrderBookList(GT);

module.exports = {
  createOrderBookSnapshot,
  getSnapshotSlices,
  firstElToFloat,
  updateAsks,
  updateBids
};
