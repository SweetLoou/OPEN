const PLINKO_ROWS = 16;
const MULTIPLIERS = {
    low: [10, 5, 1.5, 1.2, 1.1, 1, 0.5, 0.4, 0.5, 1, 1.1, 1.2, 1.5, 5, 10],
    medium: [20, 10, 5, 3, 1.5, 1, 0.4, 0.3, 0.4, 1, 1.5, 3, 5, 10, 20],
    high: [500, 100, 20, 8, 4, 2, 0.1, 0, 0.1, 2, 4, 8, 20, 100, 500],
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PLINKO_ROWS, MULTIPLIERS };
}
