import React from 'react';
import { useHistory } from 'react-router-dom';
import _ from 'lodash-es';
import moment from 'moment';
import { string } from 'yargs';

import { IResourceState } from 'modules/core/utils/createResource';
import { Tooltip } from '@material-ui/core';

import { Button, JsonViewPopover, Text } from 'components/kit';
import ControlPopover from 'components/ControlPopover/ControlPopover';
import RunNameColumn from 'components/Table/RunNameColumn';

import { TABLE_DATE_FORMAT } from 'config/dates/dates';

import { IRun } from 'types/services/models/metrics/runModel';

import createActiveRunsEngine from './ActiveRunsStore';

function useActiveRunsTable() {
  const tableRef = React.useRef<any>(null);
  const { current: activeRunsEngine } = React.useRef(createActiveRunsEngine);
  const activeRunsStore: IResourceState<IRun<unknown>> =
    activeRunsEngine.activeRunsState((state) => state);

  React.useEffect(() => {
    activeRunsEngine.fetchActiveRuns();
    return () => {
      activeRunsEngine.activeRunsState.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // memoized table data
  const tableData: {
    key: number;
    run: { name: string; hash: string };
  }[] = React.useMemo(() => {
    if (activeRunsStore.data) {
      return activeRunsStore.data.map(
        ({ props, traces, hash }: IRun<unknown>, index: number) => {
          return {
            key: index,
            experiment: props.experiment?.name,
            run: { name: props.name, hash },
            date: props.creation_time,
            step: traces.metric,
          };
        },
      );
    }
    return [];
  }, [activeRunsStore.data]);

  // memoized table columns
  const tableColumns = React.useMemo(
    () => [
      {
        dataKey: 'run',
        key: 'run',
        title: (
          <Text weight={600} size={14} tint={100}>
            Name
            <Text
              weight={600}
              size={14}
              tint={50}
              className='RunOverviewTab__cardBox__tableTitleCount'
            >
              ({tableData?.length})
            </Text>
          </Text>
        ),
        width: 'calc(70% - 200px)',
        cellRenderer: ({ cellData }: any) => (
          <p title={cellData}>
            <RunNameColumn
              active={true}
              runHash={cellData.hash}
              run={cellData.name}
            />
          </p>
        ),
      },
      {
        dataKey: 'experiment',
        key: 'experiment',
        title: (
          <Text weight={600} size={14} tint={100}>
            Experiment
            <Text
              weight={600}
              size={14}
              tint={50}
              className='RunOverviewTab__cardBox__tableTitleCount'
            >
              ({tableData?.length})
            </Text>
          </Text>
        ),
        width: '30%',
        cellRenderer: ({ cellData }: any) => <p title={cellData}>{cellData}</p>,
      },
      {
        dataKey: 'date',
        key: 'date',
        title: 'Date',
        flexGrow: 1,
        width: '200px',
        cellRenderer: ({ cellData }: any) => (
          <p title={cellData}>
            {moment(cellData * 1000).format(TABLE_DATE_FORMAT)}
          </p>
        ),
      },
      {
        dataKey: 'step',
        key: 'step',
        title: 'Step',
        flexGrow: 1,
        width: '300px',
        cellRenderer: ({ cellData }: any, index: number) => {
          const stepsData = getStepsData(cellData);
          return (
            <ControlPopover
              key={index}
              title='Steps'
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              anchor={({ onAnchorClick }) => (
                <div onClick={onAnchorClick} title={'title'}>
                  {stepsData.map((item: any) => (
                    <span style={{ marginRight: 4 }} key={item.name}>
                      {item.step}
                    </span>
                  ))}
                </div>
              )}
              component={<JsonViewPopover json={stepsData} />}
            />
          );
        },
      },
    ],
    [tableData?.length],
  );

  function getStepsData(data: any): { name: string; step: number }[] {
    return data.map((item: any) => ({
      name: item.name,
      step: item.last_value.last,
    }));
  }
  // Update the table data and columns when the activity data changes
  React.useEffect(() => {
    if (tableRef.current?.updateData) {
      tableRef.current.updateData({
        newColumns: tableColumns,
        newData: tableData,
      });
    }
  }, [tableData, tableColumns]);
  return {
    data: activeRunsStore.data,
    tableData,
    tableColumns,
    tableRef,
    loading: activeRunsStore.loading,
  };
}

export default useActiveRunsTable;
