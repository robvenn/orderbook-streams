// Each how many microseconds it will calculate and display the speed
const FREQUENCY = 10000;

class SpeedCounter {
  constructor(id, onCountInterval) {
    this.updates = [];
    this.interval = setInterval(() => {
      const updatesPerMinute =
        (this.updates.filter(u => u > Date.now() - FREQUENCY).length * 60000) /
        FREQUENCY;

      console.log(`[${id}] Speed: ${updatesPerMinute} orderbooks per minute`);
      onCountInterval(updatesPerMinute);
      this.updates = [];
    }, FREQUENCY);
  }
  update() {
    this.updates.push(Date.now());
  }
  destroy() {
    clearInterval(this.interval);
  }
}

module.exports = SpeedCounter;
