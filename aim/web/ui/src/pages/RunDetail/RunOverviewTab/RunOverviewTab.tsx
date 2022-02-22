import React from 'react';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import Card from 'components/kit/Card/Card';

import './RunOverViewTab.scss';

function RunOverviewTab() {
  return (
    <ErrorBoundary>
      <div className='RunOverviewTab'>
        <Card
          title='Parameters'
          subtitle='Little information about Params'
          className='RunOverviewTab__cardBox'
          dataListProps={{
            tableColumns: [
              {
                dataKey: 'name',
                key: 'name',
                title: 'Name',
                width: '25%',
                cellRenderer: function cellRenderer({ cellData }: any) {
                  return <p>{cellData}</p>;
                },
              },
              {
                dataKey: 'b',
                key: 'b',
                title: 'b',
                width: '25%',
                cellRenderer: function cellRenderer({ cellData }: any) {
                  return <p>{cellData}</p>;
                },
              },
              {
                dataKey: 'value',
                key: 'value',
                title: 'Value',
                width: '25%',
                cellRenderer: function cellRenderer({ cellData }: any) {
                  return <p>{cellData}</p>;
                },
              },
              {
                dataKey: 'a',
                key: 'a',
                title: 'a',
                width: '25%',
                cellRenderer: function cellRenderer({ cellData }: any) {
                  return <p>{cellData}</p>;
                },
              },
            ],
            tableData: [
              {
                b: 'asfasf',
                key: 0,
                name: 'asd',
                a: 'asfasf',
                value: 'asfasf',
              },
              {
                name: 'asd',
                b: 'asfasf',
                value: 'asfasf',
                a: 'asfasfg',
                key: 1,
              },
              {
                name: 'asd',
                b: 'hh',
                value: 'asfasf',
                a: 'asfasf',
                key: 2,
              },
              {
                name: 'asd',
                value: 'asfasf',
                b: 'sdg',
                a: 'n5hs',
                key: 3,
              },
              {
                name: 'vxc',
                value: 'efwg',
                b: 'asfasfsdgff',
                a: 'qeqe',
                key: 4,
              },
              {
                name: '[povwkser]',
                value: 'hshs',
                b: 'fwef',
                a: 'bgtbd',
                key: 5,
              },
              {
                name: 'bgtdwqd',
                value: 'vcxvd',
                b: 'ojkok',
                a: 'agtyd',
                key: 6,
              },
              {
                name: 'asvposjkvsdd',
                value: 'vbrspj',
                b: 'gsergsg',
                a: 'vpiernbanf',
                key: 7,
              },
            ],
            illustrationConfig: {
              size: 'large',
              title: 'No Results',
            },
          }}
        />
      </div>
    </ErrorBoundary>
  );
}

RunOverviewTab.displayName = 'RunOverviewTab';

export default React.memo(RunOverviewTab);
