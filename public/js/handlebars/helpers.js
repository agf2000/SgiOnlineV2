'use strict'

module.exports.currency = function (value) {
    return "R$ " + parseFloat(value).toFixed(2);
};

module.exports.percent = function (value) {
    return "% " + parseFloat(value).toFixed(2);
};

module.exports.decimals = function (value) {
    return parseFloat(value).toFixed(2);
}