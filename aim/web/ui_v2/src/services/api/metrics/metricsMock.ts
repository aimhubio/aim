function generateMetrics(count = 500, pointsCount = 50) {
  const runsContainer = [];
  for (let i = 0; i < count / 2; i++) {
    runsContainer.push({
      name: `foo${i + 1}`,
      run_hash: generateRunHash(`${i}`),
      params: {
        hparams: {},
        default: {},
        config: {},
      },
      metrics: ['test', 'val'].map((context) => {
        return {
          metric_name: 'foo',
          context: {
            subset: context,
          },
          data: {
            values: new Float64Array(
              context === 'val'
                ? [...Array(Math.ceil(pointsCount / 5))].map(
                    (e, j) => Math.random() * 1.1 + Math.random() * (j + 1),
                  )
                : [...Array(pointsCount)].map(
                    (e, j) => Math.random() * 1.1 + Math.random() * (j + 1),
                  ),
            ),
            steps: new Uint32Array(
              context === 'val'
                ? [...Array(Math.ceil(pointsCount / 5))]
                    .fill(0)
                    .map((e, i) => i * 10)
                : [...Array(pointsCount)].fill(0).map((e, i) => i * 10),
            ),
            epochs: new Uint32Array(
              context === 'val' ? [0, 1, 2] : [0, 0, 1, 1, 1, 2, 2],
            ),
            iterations: new Uint32Array(
              context === 'val'
                ? [...Array(Math.ceil(pointsCount / 5))]
                    .fill(0)
                    .map((e, i) => i * 10)
                : [...Array(pointsCount)].fill(0).map((e, i) => i * 10),
            ),
            timestamp: new Uint32Array(
              context === 'val'
                ? [1624564800000, 1624564850820, 1624564876596]
                : [
                    1624564800000, 1624564821000, 1624564834070, 1624564850820,
                    1624564857000, 1624564865427, 1624564876596,
                  ],
            ),
          },
        };
      }),
    });
  }

  return runsContainer;
}

function generateRunHash(prefix: string) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const charactersLength = characters.length;
  for (let i = 0; i < 8; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return `${prefix}${result}`;
}

export default generateMetrics;

// export default [
//   {
//     name: 'foo',
//     run_hash: 'ie7huhdiGsGUJNsdh91u92',
//     params: {
//       hparams: {},
//       default: {},
//       config: {},
//     },
//     metrics: [
//       {
//         metric_name: 'foo',
//         params: {
//           subset: 'test',
//         },
//         data: {
//           values: new Float64Array([
//             348.234234, 281.1237, 123.234324, 174.47943, 159, 97, 178.23423,
//           ]),
//           steps: new Uint32Array([0, 1, 2, 3, 4, 5, 6]),
//           epochs: new Uint32Array([0, 0, 1, 1, 1, 2, 2]),
//           iterations: new Uint32Array([0, 1, 2, 3, 4, 5, 6]),
//           timestamp: new Uint32Array([
//             1624564800000, 1624564821000, 1624564834070, 1624564850820,
//             1624564857000, 1624564865427, 1624564876596,
//           ]),
//         },
//       },
//       {
//         metric_name: 'foo',
//         params: {
//           subset: 'val',
//         },
//         data: {
//           values: new Float64Array([310.294256, 143.234324, 160]),
//           steps: new Uint32Array([0, 1, 2]),
//           epochs: new Uint32Array([0, 1, 2]),
//           iterations: new Uint32Array([0, 1, 2]),
//           timestamp: new Uint32Array([
//             1624564800000, 1624564850820, 1624564876596,
//           ]),
//         },
//       },
//     ],
//   },
//   {
//     name: 'foo',
//     run_hash: 'ie76svghdiGsGUJNsdh91u92',
//     params: {
//       hparams: {},
//       default: {},
//       config: {},
//     },
//     metrics: [
//       {
//         metric_name: 'bar',
//         params: {
//           subset: 'test',
//         },
//         data: {
//           values: new Float64Array([
//             325.234234, 291.1237, 223.234324, 174.47943, 189, 107, 148.23423,
//           ]),
//           steps: new Uint32Array([0, 1, 2, 3, 4, 5, 6]),
//           epochs: new Uint32Array([0, 0, 1, 1, 1, 2, 2]),
//           iterations: new Uint32Array([0, 1, 2, 3, 4, 5, 6]),
//           timestamp: new Uint32Array([
//             1624564800000, 1624564821000, 1624564834070, 1624564850820,
//             1624564857000, 1624564865427, 1624564876596,
//           ]),
//         },
//       },
//       {
//         metric_name: 'bar',
//         params: {
//           subset: 'val',
//         },
//         data: {
//           values: new Float64Array([320.294256, 153.231224, 130]),
//           steps: new Uint32Array([0, 1, 2]),
//           epochs: new Uint32Array([0, 1, 2]),
//           iterations: new Uint32Array([0, 1, 2]),
//           timestamp: new Uint32Array([
//             1624564800000, 1624564850820, 1624564876596,
//           ]),
//         },
//       },
//     ],
//   },
//   {
//     name: 'foo',
//     run_hash: 'ie76svghd789dfUJNsd1u92',
//     params: {
//       hparams: {},
//       default: {},
//       config: {},
//     },
//     metrics: [
//       {
//         metric_name: 'baz',
//         params: {
//           subset: 'test',
//         },
//         data: {
//           values: new Float64Array([
//             295.234234, 261.1237, 216.234324, 164.47943, 149.123, 109.678, 120,
//           ]),
//           steps: new Uint32Array([0, 1, 2, 3, 4, 5, 6]),
//           epochs: new Uint32Array([0, 0, 1, 1, 1, 2, 2]),
//           iterations: new Uint32Array([0, 1, 2, 3, 4, 5, 6]),
//           timestamp: new Uint32Array([
//             1624564800000, 1624564821000, 1624564834070, 1624564850820,
//             1624564857000, 1624564865427, 1624564876596,
//           ]),
//         },
//       },
//       {
//         metric_name: 'baz',
//         params: {
//           subset: 'val',
//         },
//         data: {
//           values: new Float64Array([290.294256, 123.923424, 110.76832]),
//           steps: new Uint32Array([0, 1, 2]),
//           epochs: new Uint32Array([0, 1, 2]),
//           iterations: new Uint32Array([0, 1, 2]),
//           timestamp: new Uint32Array([
//             1624564800000, 1624564850820, 1624564876596,
//           ]),
//         },
//       },
//     ],
//   },
// ];
