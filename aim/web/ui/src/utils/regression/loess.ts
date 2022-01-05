// Adapted from d3-regression by Harry Stevens
// License: https://github.com/HarryStevens/d3-regression/blob/master/LICENSE
// Adapted from science.js by Jason Davies
// License: https://github.com/jasondavies/science.js/blob/master/LICENSE
// Source: https://github.com/jasondavies/science.js/blob/master/src/stats/loess.js
// Adapted from vega-statistics by Jeffrey Heer
// License: https://github.com/vega/vega/blob/f058b099decad9db78301405dd0d2e9d8ba3d51a/LICENSE
// Source: https://github.com/vega/vega/blob/f21cb8792b4e0cbe2b1a3fd44b0f5db370dbaadb/packages/vega-statistics/src/regression/loess.js

import { getValuesMedian } from 'utils/getValuesMedian';

const maxiters = 2;
const epsilon = 1e-12;
let x = (d: [number, number]) => d[0];
let y = (d: [number, number]) => d[1];

export default function loess(
  data: [number, number][],
  bandwidth: number = 0.66,
) {
  const [xv, yv, ux, uy] = points(data, x, y, true);
  const n = xv.length;
  const bw = Math.max(2, ~~(bandwidth * n)); // # nearest neighbors
  const yhat = new Float64Array(n);
  const residuals = new Float64Array(n);
  const robustWeights = new Float64Array(n).fill(1);

  for (let iter = -1; ++iter <= maxiters; ) {
    const interval: [number, number] = [0, bw - 1];

    for (let i = 0; i < n; ++i) {
      const dx = xv[i];
      const i0 = interval[0];
      const i1 = interval[1];
      const edge = dx - xv[i0] > xv[i1] - dx ? i0 : i1;

      let W = 0;
      let X = 0;
      let Y = 0;
      let XY = 0;
      let X2 = 0;
      let denom = 1 / Math.abs(xv[edge] - dx || 1); // Avoid singularity

      for (let k = i0; k <= i1; ++k) {
        const xk = xv[k];
        const yk = yv[k];
        const w = tricube(Math.abs(dx - xk) * denom) * robustWeights[k];
        const xkw = xk * w;

        W += w;
        X += xkw;
        Y += yk * w;
        XY += yk * xkw;
        X2 += xk * xkw;
      }

      // Linear regression fit
      const [a, b] = ols(X / W, Y / W, XY / W, X2 / W);
      yhat[i] = a + b * dx;
      residuals[i] = Math.abs(yv[i] - yhat[i]);

      updateInterval(xv, i + 1, interval);
    }

    if (iter === maxiters) {
      break;
    }

    const medianResidual = getValuesMedian(residuals);
    if (Math.abs(medianResidual) < epsilon) break;

    for (let i = 0, arg, w; i < n; ++i) {
      arg = residuals[i] / (6 * medianResidual);
      // Default to epsilon (rather than zero) for large deviations
      // Keeping weights tiny but non-zero prevents singularites
      robustWeights[i] = arg >= 1 ? epsilon : (w = 1 - arg * arg) * w;
    }
  }

  return output(xv, yhat, ux, uy);
}

// Weighting kernel for local regression
function tricube(x: number) {
  return (x = 1 - x * x * x) * x * x;
}

// Advance sliding window interval of nearest neighbors
function updateInterval(
  xv: Float64Array,
  i: number,
  interval: [number, number],
) {
  let val = xv[i];
  let left = interval[0];
  let right = interval[1] + 1;

  if (right >= xv.length) return;

  // Step right if distance to new right edge is <= distance to old left edge
  // Step when distance is equal to ensure movement over duplicate x values
  while (i > left && xv[right] - val <= val - xv[left]) {
    interval[0] = ++left;
    interval[1] = right;
    ++right;
  }
}

// Generate smoothed output points
// Average points with repeated x values
function output(xv: Float64Array, yhat: Float64Array, ux: number, uy: number) {
  const n = xv.length;
  const out = [];
  let i = 0;
  let cnt = 0;
  let prev: number[] = [];
  let v: number;

  for (; i < n; ++i) {
    v = xv[i] + ux;
    if (prev[0] === v) {
      // Average output values
      prev[1] += (yhat[i] - prev[1]) / ++cnt;
    } else {
      // Add new output point
      cnt = 0;
      prev[1] += uy;
      prev = [v, yhat[i]];
      out.push(prev);
    }
  }
  prev[1] += uy;

  return out;
}

function points(
  data: [number, number][],
  x: (d: [number, number]) => number,
  y: (d: [number, number]) => number,
  sort: boolean,
): [Float64Array, Float64Array, number, number] {
  data = data.filter((d: [number, number]) => {
    let u = x(d);
    let v = y(d);
    return u != null && isFinite(u) && v != null && isFinite(v);
  });

  if (sort) {
    data.sort((a: [number, number], b: [number, number]) => x(a) - x(b));
  }

  const n = data.length;
  const X = new Float64Array(n);
  const Y = new Float64Array(n);

  // extract values, calculate means
  let ux = 0;
  let uy = 0;
  let xv;
  let yv;
  let d;
  for (let i = 0; i < n; ) {
    d = data[i];
    X[i] = xv = +x(d);
    Y[i] = yv = +y(d);
    ++i;
    ux += (xv - ux) / i;
    uy += (yv - uy) / i;
  }

  // mean center the data
  for (let i = 0; i < n; ++i) {
    X[i] -= ux;
    Y[i] -= uy;
  }

  return [X, Y, ux, uy];
}

function ols(uX: number, uY: number, uXY: number, uX2: number) {
  const delta = uX2 - uX * uX;
  const slope = Math.abs(delta) < 1e-24 ? 0 : (uXY - uX * uY) / delta;
  const intercept = uY - slope * uX;

  return [intercept, slope];
}
