const hparams = {
  lr: [0.0001, 0.0003, 0.0007, 0.001, 0.002, 0.01],
  batch_size: [32, 64],
  seed: [1, 3, 5, 7],
  foo: ['bar', 'baz'],
};

function generateMetrics(count = 500, pointsCount = 50) {
  const runsContainer = [];
  for (let i = 0; i < count / 2; i++) {
    runsContainer.push({
      experiment_name: `experiment${i + 1}`,
      name: `runs${i + 1}`,
      run_hash: generateRunHash(`${i}`),
      params: {
        hparams: {
          lr: hparams.lr[Math.round(Math.random() * 6)],
          batch_size: hparams.batch_size[Math.round(Math.random() * 2)],
          seed: hparams.seed[Math.round(Math.random() * 4)],
          foo: hparams.foo[Math.round(Math.random() * 2)],
        },
      },
      metrics: ['train', 'val'].map((context) => {
        return {
          metric_name: 'foo',
          context: {
            subset: context,
          },
          data: {
            values: new Float64Array(
              context === 'val'
                ? [...Array(Math.ceil(pointsCount / 3))].map(
                    (e, j) => Math.random() * -1.1 + Math.random() * (j + 1),
                  )
                : [...Array(pointsCount)].map(
                    (e, j) => Math.random() * -1.1 + Math.random() * (j + 1),
                  ),
            ),
            steps: new Uint32Array(
              context === 'val'
                ? [...Array(Math.ceil(pointsCount / 3))]
                    .fill(0)
                    .map((e, i) => i * 10)
                : [...Array(pointsCount)].fill(0).map((e, i) => i * 10),
            ),
            epochs: new Uint32Array(
              context === 'val' ? [0, 1, 2] : [0, 0, 1, 1, 1, 2, 2],
            ),
            iterations: new Uint32Array(
              context === 'val'
                ? [...Array(Math.ceil(pointsCount / 3))]
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
