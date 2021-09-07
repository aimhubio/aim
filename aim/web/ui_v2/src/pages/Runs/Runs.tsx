import React from 'react';
import RunsTable from './RunsTable';

import './Runs.scss';
import RunsBar from './components/RunsBar/RunsBar';
import SearchBar from './components/SearchBar/SearchBar';

function Runs(props: any): React.FunctionComponentElement<React.ReactNode> {
  return (
    <div className='Runs__container'>
      <section className='Runs__section'>
        <div className='Runs__section__div Runs__fullHeight'>
          <RunsBar />
          <SearchBar
            onSearchInputChange={props.onSelectRunQueryChange}
            searchValue={props.query}
            isRunsDataLoading={props.isRunsDataLoading}
            updateSelectStateUrl={props.updateSelectStateUrl}
          />
          <div className='Runs__table__container'>
            <RunsTable
              tableRowHeight={props.tableRowHeight}
              columns={props.tableColumns}
              runsList={props.tableData}
              isRunsDataLoading={props.isRunsDataLoading}
              tableRef={props.tableRef}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

export default Runs;
