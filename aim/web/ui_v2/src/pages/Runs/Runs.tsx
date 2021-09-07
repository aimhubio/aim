import React from 'react';
import RunsTable from './RunsTable';

import './Runs.scss';
import RunsBar from './components/RunsBar/RunsBar';
import SearchBar from './components/SearchBar/SearchBar';

function Runs(props: any): React.FunctionComponentElement<React.ReactNode> {
  const tableRef = React.useRef<any>({});

  // return (
  //   <Box
  //     bgcolor='grey.200'
  //     component='section'
  //     height='100vh'
  //     overflow='hidden'
  //     className='Params'
  //   >
  //     <Grid
  //       container
  //       direction='column'
  //       justifyContent='center'
  //       className='Params__fullHeight'
  //       spacing={1}
  //     >
  //       <Grid item>
  //         {runsData?.map((run: IRun<IMetricTrace | IParamTrace>) => (
  //           <NavLink key={run.hash} to={`runs/${run.hash}`}>
  //             <p>{run.hash}</p>
  //           </NavLink>
  //         ))}
  //       </Grid>
  //     </Grid>
  //   </Box>
  // );
  return (
    <div className='Runs__container'>
      <section className='Runs__section'>
        <div className='Runs__section__div Runs__fullHeight'>
          <RunsBar />
          <SearchBar
            onSearchInputChange={() => null}
            searchValue={''}
            isRunsDataLoading
          />
          <div ref={props.tableElemRef} className='Runs__table__container'>
            <RunsTable
              runsList={props.tableData}
              isRunsDataLoading={props.isRunsDataLoading}
              tableRef={tableRef}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

export default Runs;
