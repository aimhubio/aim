import COLORS from 'config/colors/colors';

import { encode } from 'utils/encoder/encoder';
/* eslint-disable no-loop-func */
function randomGenerateLineData(count: number, dimensions: any) {
  const dKeys = Object.keys(dimensions);
  const data: any = [];
  let f = 0;
  for (let i = 0; i < count; i++) {
    let a = {};
    f++;
    dKeys.forEach((key) => {
      f = f + 1;
      if (f % 13 === 0) {
        //@ts-ignore
        a[key] = null;
      } else {
        if (dimensions[key].scaleType === 'linear') {
          //@ts-ignore
          a[key] = getRandomIntInclusive(...dimensions[key].domainData);
        } else {
          //@ts-ignore
          a[key] =
            dimensions[key].domainData[
              getRandomDoubleInclusive(0, dimensions[key].domainData.length - 1)
            ];
        }
      }
    });
    data.push({
      values: a,
      key: encode({ a }),
      color: COLORS[0][i % COLORS[0].length],
    });
  }

  return {
    dimensions,
    data,
  };
}

export const mockData = randomGenerateLineData(10, {
  column1: { scaleType: 'linear', domainData: [2, 5.6] },
  column2: {
    scaleType: 'point',
    domainData: [
      '+inf',
      'None',
      '12',
      'hinalsfhsaifhsaifhoasihfoiawhfiwahfoiawhfowihhinalsfhsaifhsaifhoasihfoiawhfiwahfoiawhfowihff',
      '-inf',
    ],
  },
  column3: { scaleType: 'linear', domainData: [3, 5] },
  column4: { scaleType: 'linear', domainData: [1, 2] },
  column5: { scaleType: 'linear', domainData: [8, 22] },
  column6: { scaleType: 'linear', domainData: [45, 60] },
});

export const mockData2 = randomGenerateLineData(15, {
  column1: { scaleType: 'linear', domainData: [2, 5.6] },
  column2: {
    scaleType: 'point',
    domainData: [
      '+inf',
      'None',
      '12',
      'hinalsfhsaifhsaifhoasihfoiawhfiwahfoiawhfowihhinalsfhsaifhsaifhoasihfoiawhfiwahfoiawhfowihff',
      '-inf',
    ],
  },
  column3: { scaleType: 'linear', domainData: [3, 5] },
  column4: { scaleType: 'linear', domainData: [1, 2] },
  column5: { scaleType: 'linear', domainData: [8, 22] },
  column6: { scaleType: 'linear', domainData: [45, 60] },
});

function getRandomIntInclusive(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function getRandomDoubleInclusive(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
