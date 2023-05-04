import React, { memo, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import moment from 'moment';
import _ from 'lodash-es';

import { Tooltip } from '@material-ui/core';

import Table from 'components/Table/Table';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import StatusLabel from 'components/StatusLabel';

import { TABLE_DATE_FORMAT } from 'config/dates/dates';

import { ITagRun } from 'types/pages/tags/Tags';

import { processDurationTime } from 'utils/processDurationTime';

function TagRunsTable({
  runsList,
}: {
  runsList: ITagRun[];
}): React.FunctionComponentElement<React.ReactNode> {
  const tableRef = useRef<any>({});
  const tableColumns = [
    {
      dataKey: 'name',
      key: 'name',
      title: 'Name',
      width: 0,
      flexGrow: 1,
      cellRenderer: function cellRenderer({
        cellData,
      }: {
        cellData: { name: string; id: string; active: boolean };
      }) {
        return (
          <>
            <Tooltip title={cellData.active ? 'In Progress' : 'Finished'}>
              <div>
                <StatusLabel
                  className='Table__status_indicator'
                  status={cellData.active ? 'success' : 'alert'}
                />
              </div>
            </Tooltip>
            <Tooltip title={cellData.name}>
              <div>
                <NavLink to={`/runs/${cellData.id}`}>
                  <p className='TagsTable__runName'>{cellData.name}</p>
                </NavLink>
              </div>
            </Tooltip>
          </>
        );
      },
    },
    {
      dataKey: 'date',
      key: 'date',
      title: 'Date',
      width: 200,
      cellRenderer: function cellRenderer({ cellData }: { cellData: string }) {
        return <p className='TagsTable__runCreatedDate'>{cellData}</p>;
      },
    },
    {
      dataKey: 'duration',
      key: 'duration',
      title: 'Duration',
      width: 200,
      cellRenderer: function cellRenderer({ cellData }: { cellData: string }) {
        return <p className='TagsTable__runDuration'>{cellData}</p>;
      },
    },
  ];

  useEffect(() => {
    if (runsList) {
      tableRef?.current?.updateData({
        // eslint-disable-next-line react/prop-types
        newData: runsList.map((run: ITagRun) => ({
          name: {
            name: run.name,
            id: run.run_id,
            active: _.isNil(run.end_time),
          },
          date: moment(run.creation_time * 1000).format(TABLE_DATE_FORMAT),
          duration: processDurationTime(
            run.creation_time * 1000,
            run.end_time ? run.end_time * 1000 : Date.now(),
          ),
          key: run.run_id,
        })),
        newColumns: tableColumns,
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runsList]);

  return (
    <ErrorBoundary>
      <div className='TagsTable'>
        <Table
          ref={tableRef}
          fixed={false}
          columns={tableColumns}
          data={[]}
          hideHeaderActions
          rowHeight={32}
          headerHeight={32}
          height='calc(100% - 10px)'
          disableRowClick
        />
      </div>
    </ErrorBoundary>
  );
}

export default memo(TagRunsTable);
