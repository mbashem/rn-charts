"use strict";

export function arrayFrom(maxValue, interval) {
  return Array.from({
    length: Math.floor(maxValue / interval) + 1
  }, (_, i) => i * interval);
}
export const stringToArray = (s, separator) => {
  return s.trim().split(separator);
};
export const increment = (char, by) => {
  return String.fromCharCode(char.charCodeAt(0) + by);
};
export const getRandomInteger = (min, max) => {
  return Math.floor(Math.random() * (max - min)) + min;
};
export const parseQuery = queryString => {
  queryString = queryString.trim();
  var query = {};
  var pairs = (queryString[0] === "?" ? queryString.substr(1) : queryString).split("&");
  for (var i = 0; i < pairs.length; i++) {
    var pair = pairs[i].split("=");
    query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || "");
  }
  return query;
};
export const processNumber = (num, min, max) => {
  if (isNaN(num)) return min;
  if (num < min) return min;
  if (num > max) return max;
  return num;
};

/**
 * 
 * @param {number} value - The number.
 * @param {Intl.NumberFormatOptions} options - The options.
 *  Default Value: { maximumFractionDigits: 2, minimumFractionDigits: 0 }
 * @returns {string} Returns the number in as formatted string.
 * 
 * @example
 * const result = getFormattedString(3.012)
 * console.log(result); // 3.01
 */
export function getFormattedString(value, options = {
  maximumFractionDigits: 2,
  minimumFractionDigits: 0
}) {
  return value.toLocaleString("en-US", options);
}
export function isNumber(value) {
  return typeof value === 'number';
}
;
export function isNonNANNumber(value) {
  return isNumber(value) && !isDefined(value);
}
export function isStringNumber(value) {
  return !isNaN(Number(value));
}
export function isDefined(value) {
  return value !== undefined && value !== null && (typeof value !== 'number' || !isNaN(value));
}
;
export function isFunction(value) {
  return typeof value === 'function';
}
export function isString(node) {
  return typeof node === "string";
}
//# sourceMappingURL=util.js.map