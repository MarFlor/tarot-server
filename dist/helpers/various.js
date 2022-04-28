"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShuffleDeck = void 0;
const ShuffleDeck = (array) => {
    var currentIndex = array.length, temporaryValue, randomIndex;
    while (0 !== currentIndex) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
};
exports.ShuffleDeck = ShuffleDeck;
//# sourceMappingURL=various.js.map