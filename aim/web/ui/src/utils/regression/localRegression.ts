import { getValuesMedian } from 'utils/getValuesMedian';

// Based on org.apache.commons.math.analysis.interpolation.LoessInterpolator
// from http://commons.apache.org/math/
function loess() {
  let bandwidth = 0.66;
  let robustnessIters = 2;
  let accuracy = 1e-12;

  function smooth(xval: number[], yval: number[], weights: number[]) {
    let n = xval.length;
    let i;

    if (n !== yval.length) {
      throw { error: 'Mismatched array lengths' };
    }

    if (n == 0) {
      throw { error: 'At least one point required.' };
    }

    if (arguments.length < 3) {
      weights = [];
      i = -1;
      while (++i < n) {
        weights[i] = 1;
      }
    }

    science_stats_loessFiniteReal(xval);
    science_stats_loessFiniteReal(yval);
    science_stats_loessFiniteReal(weights);
    science_stats_loessStrictlyIncreasing(xval);

    if (n == 1) {
      return [yval[0]];
    }
    if (n == 2) {
      return [yval[0], yval[1]];
    }

    let bandwidthInPoints = Math.floor(bandwidth * n);

    if (bandwidthInPoints < 2) {
      throw { error: 'Bandwidth too small.' };
    }

    let res = [];
    let residuals = [];
    let robustnessWeights = [];

    // Do an initial fit and 'robustnessIters' robustness iterations.
    // This is equivalent to doing 'robustnessIters+1' robustness iterations
    // starting with all robustness weights set to 1.
    i = -1;
    while (++i < n) {
      res[i] = 0;
      residuals[i] = 0;
      robustnessWeights[i] = 1;
    }

    let iter = -1;
    while (++iter <= robustnessIters) {
      let bandwidthInterval = [0, bandwidthInPoints - 1];
      // At each x, compute a local weighted linear regression
      let x;
      i = -1;
      while (++i < n) {
        x = xval[i];

        // Find out the interval of source points on which
        // a regression is to be made.
        if (i > 0) {
          science_stats_loessUpdateBandwidthInterval(
            xval,
            weights,
            i,
            bandwidthInterval,
          );
        }

        let ileft = bandwidthInterval[0];
        let iright = bandwidthInterval[1];

        // Compute the point of the bandwidth interval that is
        // farthest from x
        let edge =
          xval[i] - xval[ileft] > xval[iright] - xval[i] ? ileft : iright;

        // Compute a least-squares linear fit weighted by
        // the product of robustness weights and the tricube
        // weight function.
        // See http://en.wikipedia.org/wiki/Linear_regression
        // (section "Univariate linear case")
        // and http://en.wikipedia.org/wiki/Weighted_least_squares
        // (section "Weighted least squares")
        let sumWeights = 0;
        let sumX = 0;
        let sumXSquared = 0;
        let sumY = 0;
        let sumXY = 0;
        let denom = Math.abs(1 / (xval[edge] - x));

        for (let k = ileft; k <= iright; ++k) {
          let xk = xval[k];
          let yk = yval[k];
          let dist = k < i ? x - xk : xk - x;
          let w =
            science_stats_loessTricube(dist * denom) *
            robustnessWeights[k] *
            weights[k];
          let xkw = xk * w;
          sumWeights += w;
          sumX += xkw;
          sumXSquared += xk * xkw;
          sumY += yk * w;
          sumXY += yk * xkw;
        }

        let meanX = sumX / sumWeights;
        let meanY = sumY / sumWeights;
        let meanXY = sumXY / sumWeights;
        let meanXSquared = sumXSquared / sumWeights;

        let beta =
          Math.sqrt(Math.abs(meanXSquared - meanX * meanX)) < accuracy
            ? 0
            : (meanXY - meanX * meanY) / (meanXSquared - meanX * meanX);

        let alpha = meanY - beta * meanX;

        res[i] = beta * x + alpha;
        residuals[i] = Math.abs(yval[i] - res[i]);
      }

      // No need to recompute the robustness weights at the last
      // iteration, they won't be needed anymore
      if (iter === robustnessIters) {
        break;
      }

      // Recompute the robustness weights.

      // Find the median residual.
      let medianResidual = getValuesMedian(residuals);

      if (Math.abs(medianResidual) < accuracy) {
        break;
      }

      let arg;
      let w;
      i = -1;
      while (++i < n) {
        arg = residuals[i] / (6 * medianResidual);
        robustnessWeights[i] = arg >= 1 ? 0 : (w = 1 - arg * arg) * w;
      }
    }

    return res;
  }

  smooth.bandwidth = function (x: number) {
    if (!arguments.length) {
      return x;
    }
    bandwidth = x;
    return smooth;
  };

  smooth.robustnessIterations = function (x: number) {
    if (!arguments.length) {
      return x;
    }
    robustnessIters = x;
    return smooth;
  };

  smooth.accuracy = function (x: number) {
    if (!arguments.length) {
      return x;
    }
    accuracy = x;
    return smooth;
  };

  return smooth;
}

function science_stats_loessFiniteReal(values: number[]) {
  let n = values.length;
  let i = -1;

  while (++i < n) {
    if (!isFinite(values[i])) {
      return false;
    }
  }

  return true;
}

function science_stats_loessStrictlyIncreasing(xval: number[]) {
  let n = xval.length;
  let i = 0;

  while (++i < n) {
    if (xval[i - 1] >= xval[i]) {
      return false;
    }
  }

  return true;
}

// Compute the tricube weight function.
// http://en.wikipedia.org/wiki/Local_regression#Weight_function
function science_stats_loessTricube(x: number) {
  return (x = 1 - x * x * x) * x * x;
}

// Given an index interval into xval that embraces a certain number of
// points closest to xval[i-1], update the interval so that it embraces
// the same number of points closest to xval[i], ignoring zero weights.
function science_stats_loessUpdateBandwidthInterval(
  xval: number[],
  weights: number[],
  i: number,
  bandwidthInterval: number[],
) {
  let left = bandwidthInterval[0];
  let right = bandwidthInterval[1];

  // The right edge should be adjusted if the next point to the right
  // is closer to xval[i] than the leftmost point of the current interval
  let nextRight = science_stats_loessNextNonzero(weights, right);
  if (
    nextRight < xval.length &&
    xval[nextRight] - xval[i] < xval[i] - xval[left]
  ) {
    let nextLeft = science_stats_loessNextNonzero(weights, left);
    bandwidthInterval[0] = nextLeft;
    bandwidthInterval[1] = nextRight;
  }
}

function science_stats_loessNextNonzero(weights: number[], i: number) {
  let j = i + 1;
  while (j < weights.length && weights[j] === 0) {
    j++;
  }
  return j;
}

export default loess;
