import { toEqual } from 'tests/utils';

import { getArtifactsTableData } from './getArtifactsTableData';

// Regression test for https://github.com/aimhubio/aim/issues/3425
describe('[getArtifactsTableData]', () => {
  const artifacts = [
    {
      name: 'class_distribution_train.png',
      path: '/tmp/tmpo2601_au/class_distribution_train.png',
      uri: 's3://aim/d404e5aabbf045718a9e5e31/class_distribution_train.png',
    },
    {
      name: 'confusion_matrix.json',
      path: '/tmp/tmpadqty7bf/confusion_matrix.json',
      uri: 's3://aim/d404e5aabbf045718a9e5e31/confusion_matrix.json',
    },
    {
      name: 'reports/training_report.html',
      path: '/tmp/tmp_x1fuv8f/training_report.html',
      uri: 's3://aim/d404e5aabbf045718a9e5e31/reports/training_report.html',
    },
  ];

  it('keeps the artifacts data and order intact', () => {
    const tableData = getArtifactsTableData(artifacts);

    toEqual(tableData.length, artifacts.length);
    artifacts.forEach((artifact, index) => {
      expect(tableData[index]).toMatchObject(artifact);
    });
  });

  it('assigns a unique key to every row, so row heights are not mixed up', () => {
    const tableData = getArtifactsTableData(artifacts);
    const keys = tableData.map((row) => row.key);

    toEqual(
      keys,
      artifacts.map(({ name }) => name),
    );
    // the table keeps a `rowKey -> rowHeight` map, duplicated keys make it
    // apply the height measured for one row to every row, which makes the list
    // jump around
    toEqual(new Set(keys).size, artifacts.length);
  });

  it('falls back to the row index when an artifact has no name or uri', () => {
    const tableData = getArtifactsTableData([
      { name: '', path: '', uri: '' },
      { name: '', path: '', uri: '' },
    ] as any);

    toEqual(
      tableData.map((row) => row.key),
      [0, 1],
    );
  });

  it('returns an empty list when there are no artifacts', () => {
    toEqual(getArtifactsTableData(undefined), []);
    toEqual(getArtifactsTableData(null), []);
  });
});
