class Tracker {
    construtor() {
        this.startTime = 0;
    }

    startTimer() {
        this.startTime = Date.now();
    }

    result() {
        const result = Date.now() - this.startTime;
        this.startTime = 0;
        return result;
    }
}

module.exports = Tracker;
