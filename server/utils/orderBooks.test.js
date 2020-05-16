const { expect } = require("chai");

const { updateAsks, updateBids } = require("./orderBooks");

describe("orderBooks", function() {
  describe("updateAsks()", function() {
    const initCurrentAsks = () => [
      [1, "1", "1.1"],
      [2, "2", "2.2"],
      [3, "3", "3.3"]
    ];
    let currentAsks;

    beforeEach(function() {
      currentAsks = initCurrentAsks();
    });

    it("should return undefined if no asks are updated, prices not equal or higher", function() {
      expect(
        updateAsks(currentAsks, [
          [4, "4", "4.4"],
          [5, "5", "5.5"],
          [6, "6", "6.6"]
        ])
      ).to.equal(undefined);
    });
    it("should return updated asks, replacing a row if volume is set and a price is the same", function() {
      expect(
        updateAsks(currentAsks, [
          [3, "3", "3.33"],
          [4, "4", "4.4"]
        ])
      ).to.deep.equal([
        [1, "1", "1.1"],
        [2, "2", "2.2"],
        [3, "3", "3.33"]
      ]);
    });
    it("should return updated asks, removing a row if the volume is 0", function() {
      expect(
        updateAsks(currentAsks, [
          [3, "0.00000000", "3.33"],
          [4, "4", "4.4"]
        ])
      ).to.deep.equal([
        [1, "1", "1.1"],
        [2, "2", "2.2"]
      ]);
    });
    it("should return updated asks, adding a row before a higher number", function() {
      expect(
        updateAsks(currentAsks, [
          [3.3, "3", "3.33"],
          [1.5, "1.5", "1.55"]
        ])
      ).to.deep.equal([
        [1, "1", "1.1"],
        [1.5, "1.5", "1.55"],
        [2, "2", "2.2"],
        [3, "3", "3.3"]
      ]);
    });
  });

  describe("updateBids()", function() {
    const initCurrentBids = () => [
      [3, "3", "3.3"],
      [2, "2", "2.2"],
      [1, "1", "1.1"]
    ];
    let currentBids;

    beforeEach(function() {
      currentBids = initCurrentBids();
    });

    it("should return undefined if no bids are updated, prices not equal or lower", function() {
      expect(
        updateBids(currentBids, [
          [0.1, "4", "4.4"],
          [0.2, "5", "5.5"],
          [0.3, "6", "6.6"]
        ])
      ).to.equal(undefined);
    });
    it("should return updated bids, replacing a row if volume is set and a price is the same", function() {
      expect(
        updateBids(currentBids, [
          [0.99, "0.99", "0.99"],
          [1.01, "1.01", "1.01"]
        ])
      ).to.deep.equal([
        [3, "3", "3.3"],
        [2, "2", "2.2"],
        [1.01, "1.01", "1.01"],
        [1, "1", "1.1"]
      ]);
    });
    it("should return updated bids, removing a row if the volume is 0", function() {
      expect(
        updateBids(currentBids, [
          [3, "0.00000000", "3.33"],
          [0.1, "0.1", "0.1"]
        ])
      ).to.deep.equal([
        [2, "2", "2.2"],
        [1, "1", "1.1"]
      ]);
    });
    it("should return updated bids, adding a row before a lower number", function() {
      expect(
        updateBids(currentBids, [
          [0.5, "0.5", "0.5"],
          [1.5, "1.5", "1.55"]
        ])
      ).to.deep.equal([
        [3, "3", "3.3"],
        [2, "2", "2.2"],
        [1.5, "1.5", "1.55"],
        [1, "1", "1.1"]
      ]);
    });
  });
});
