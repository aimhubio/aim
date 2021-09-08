import * as React from 'react';

function getRunsTableColumns(
  runColumns: string[] = [],
  groupFields?: { [key: string]: string } | null,
): any {
  const columns = [
    {
      key: 'experiment',
      content: <span>Experiment</span>,
      topHeader: 'Metrics',
      pin: 'left',
    },
    {
      key: 'run',
      content: <span>Run</span>,
      topHeader: 'Metrics',
    },
    {
      key: 'metric',
      content: <span>Metric</span>,
      topHeader: 'Metrics',
    },
  ].concat(
    runColumns.map((param) => ({
      key: param,
      content: <span>{param}</span>,
      topHeader: 'Params',
    })),
  );
  if (groupFields) {
    Object.keys(groupFields).forEach((field) => {
      const key = field.replace('run.params.', '');
      const column = columns.find((col) => col.key === key);
      if (!!column) {
        column.pin = 'left';
        column.topHeader = 'Grouping';
      }
    });
    columns.sort((a, b) => {
      if (a.key === '#') {
        return -1;
      } else if (
        groupFields.hasOwnProperty(a.key) ||
        groupFields.hasOwnProperty(`run.params.${a.key}`)
      ) {
        return -1;
      }
      return 0;
    });
  }
  return columns;
}

export { getRunsTableColumns };
