import COLORS from 'config/colors/colors';

function getScattersMockData(count: number = 100) {
  return new Array(count).fill('').map((v, i) => ({
    key: `${i}`,
    data: {
      xValues: [Math.random() * 1.5 + Math.random() * 5],
      yValues: [Math.random() * 2.5 + Math.random() * 10],
    },
    color: COLORS[0][i % COLORS[0].length],
    selectors: [`${i}`],
    groupKey: `${i}`,
    chartIndex: 0,
  }));
}

export default getScattersMockData;
