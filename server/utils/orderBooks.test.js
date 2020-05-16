const { expect } = require("chai");

const { updateAsks } = require("./orderBooks");

const currentTasks = [
  [1, "1", "1.1"],
  [2, "2", "2.2"],
  [3, "3", "3.3"]
];

describe("orderBooks", function() {
  describe("updateAsks()", function() {
    it("should return undefined if no asks are updated, prices not equal or higher", function() {
      expect(
        updateAsks(currentTasks, [
          [4, "4", "4.4"],
          [5, "5", "5.5"],
          [6, "6", "6.6"]
        ])
      ).to.equal(undefined);
    });
    it("should return updated asks, replacing a row if a price is the same", function() {
      expect(
        updateAsks(currentTasks, [
          [3, "3", "3.33"],
          [4, "4", "4.4"]
        ])
      ).to.deep.equal([
        [1, "1", "1.1"],
        [2, "2", "2.2"],
        [3, "3", "3.33"]
      ]);
    });
    it("should return updated asks, adding a row before a higher number and removing non top-3", function() {
      expect(
        updateAsks(currentTasks, [
          [3, "3", "3.33"],
          [1.5, "1.5", "1.55"]
        ])
      ).to.deep.equal([
        [1, "1", "1.1"],
        [1.5, "1.5", "1.55"],
        [2, "2", "2.2"]
      ]);
    });
  });
});
