import React from 'react';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import Card from 'components/Card/Card';

import './RunOverViewTab.scss';

function RunOverviewTab() {
  return (
    <ErrorBoundary>
      <div className='RunOverviewTab'>
        <Card
          name='Parameters'
          title='Little information about Params'
          className='RunOverviewTab__cardBox'
          dataListProps={{
            tableColumns: [
              {
                dataKey: 'name',
                key: 'name',
                title: 'Name',
                flexGrow: 1,
                cellRenderer: function cellRenderer({ cellData }: any) {
                  return <p>{cellData}</p>;
                },
              },
              {
                dataKey: 'b',
                key: 'b',
                title: 'b',
                flexGrow: 1,
                cellRenderer: function cellRenderer({ cellData }: any) {
                  return <p>{cellData}</p>;
                },
              },
              {
                dataKey: 'value',
                key: 'value',
                title: 'Value',
                flexGrow: 1,
                cellRenderer: function cellRenderer({ cellData }: any) {
                  return <p>{cellData}</p>;
                },
              },
              {
                dataKey: 'a',
                key: 'a',
                title: 'a',
                flexGrow: 1,
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
              // {
              //   name: 'asd',
              //   texf: 'asfasf',
              //   value: 'asfasf',
              //   a: 'asfasf',
              //   key: 2,
              // },
              // {
              //   name: 'asd',
              //   value: 'asfasf',
              //   texf: 'asfasf',
              //   a: 'asfasf',
              //   key: 3,
              // },
              // {
              //   name: 'asd',
              //   value: 'asfasf',
              //   texf: 'asfasf',
              //   a: 'asfasf',
              //   key: 4,
              // },
              // {
              //   name: 'asd',
              //   value: 'asfasf',
              //   texf: 'asfasf',
              //   a: 'asfasf',
              //   key: 5,
              // },
              // {
              //   name: 'asd',
              //   value: 'asfasf',
              //   texf: 'asfasf',
              //   a: 'asfasf',
              //   key: 6,
              // },
              // {
              //   name: 'asd',
              //   value: 'asfasf',
              //   texf: 'asfasf',
              //   a: 'asfasf',
              //   key: 7,
              // },
              // {
              //   name: 'asd',
              //   value: 'asfasf',
              //   texf: 'asfasf',
              //   a: 'asfasf',
              //   key: 8,
              // },
              // {
              //   name: 'asd',
              //   value: 'asfasf',
              //   texf: 'asfasf',
              //   a: 'asfasf',
              //   key: 9,
              // },
            ],
          }}
        />
        <Card
          name='Params'
          title='Little information about Params'
          className='RunOverviewTab__cardBox'
        >
          <div>asfasfsa</div>
        </Card>
        <Card name='Params'>
          <div>asfasfsa</div>
        </Card>
      </div>
    </ErrorBoundary>
  );
}

RunOverviewTab.displayName = 'RunOverviewTab';

export default React.memo(RunOverviewTab);
