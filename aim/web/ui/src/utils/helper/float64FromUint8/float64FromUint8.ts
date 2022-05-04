/**
 * [Parse Uint8Array to Float64Array]
 *
 * Usage: float64FromUint8(buffer)
 *
 * @param {Uint8Array} uint8 Uint8Array to be parsed to Float64Array,
 * @returns {Float64Array}
 */
function float64FromUint8(uint8: Uint8Array): Float64Array {
  return new Float64Array(uint8.slice().buffer);
}

export default float64FromUint8;
