// Each how many microseconds it will calculate and display the speed
const FREQUENCY = 10000;

const updates = [];

module.exports = {
  send(...params) {
    updates.push(Date.now());
    // This is where all the orderbooks updates go to be processed by an external system.
  }
};

setInterval(() => {
  const updatesPerMinute =
    (updates.filter(u => u > Date.now() - FREQUENCY).length * 60000) /
    FREQUENCY;

  console.log(`[sink] Speed: ${updatesPerMinute} orderbooks per minute`);
}, FREQUENCY);
