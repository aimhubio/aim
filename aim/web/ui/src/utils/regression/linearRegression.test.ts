import { toEqual } from 'tests/utils';

import { linearRegression, linearRegressionLine } from './linearRegression';

describe('[linearRegression calculation]', () => {
  it('correctly generates a line for a 0, 0 to 1, 1 dataset', () => {
    const l = linearRegressionLine(
      linearRegression([
        [0, 0],
        [1, 1],
      ]),
    );
    toEqual(l(0), 0);
    toEqual(l(0.5), 0.5);
    toEqual(l(1), 1);
  });

  it('correctly generates a line for a 0, 0 to 1, 0 dataset', () => {
    const l = linearRegressionLine(
      linearRegression([
        [0, 0],
        [1, 0],
      ]),
    );
    toEqual(l(0), 0);
    toEqual(l(0.5), 0);
    toEqual(l(1), 0);
  });

  it('handles a single-point sample', () => {
    const l = linearRegressionLine(linearRegression([[0, 0]]));
    toEqual(l(10), 0);
  });

  it('a straight line will have a slope of 0', () => {
    toEqual(
      linearRegression([
        [0, 0],
        [1, 0],
      ]),
      { m: 0, b: 0 },
    );
  });

  it('a line at 50% grade', () => {
    toEqual(
      linearRegression([
        [0, 0],
        [1, 0.5],
      ]),
      { m: 0.5, b: 0 },
    );
  });

  it('a line with a high y-intercept', () => {
    toEqual(
      linearRegression([
        [0, 20],
        [1, 10],
      ]),
      { m: -10, b: 20 },
    );
  });
});
