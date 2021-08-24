import React from 'react';
import { Grid } from '@material-ui/core';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';

import Controls from './components/Controls/Controls';
import SelectForm from './components/SelectForm/SelectForm';
import ChartPanel from 'components/ChartPanel/ChartPanel';
import { IParamsProps } from 'types/pages/params/Params';
import { ChartTypeEnum } from 'utils/d3';
import './Params.scss';

const Params = ({
  curveInterpolation,
  onCurveInterpolationChange,
  highPlotData,
  onActivePointChange,
  chartPanelRef,
  chartElemRef,
  focusedState,
  isVisibleColorIndicator,
  tooltipContent,
  onColorIndicatorChange,
  wrapperElemRef,
  resizeElemRef,
}: IParamsProps): React.FunctionComponentElement<React.ReactNode> => {
  return (
    <div ref={wrapperElemRef} className='Params__container'>
      <section className='Params__section'>
        <Grid
          container
          direction='column'
          justifyContent='center'
          className='Params__fullHeight'
        >
          {/* <Grid item>
            <AppBar
              onBookmarkCreate={props.onBookmarkCreate}
              onBookmarkUpdate={props.onBookmarkUpdate}
              onResetConfigData={props.onResetConfigData}
            />
          </Grid> */}
          <Grid item>
            <div className='Params__SelectForm__Grouping__container'>
              <SelectForm
                selectedMetricsData={[]}
                onMetricsSelectChange={() => {}}
              />
              {/* <Grouping
              groupingData={props.groupingData}
              onGroupingSelectChange={props.onGroupingSelectChange}
              onGroupingModeChange={props.onGroupingModeChange}
              onGroupingPaletteChange={props.onGroupingPaletteChange}
              onGroupingReset={props.onGroupingReset}
              onGroupingApplyChange={props.onGroupingApplyChange}
              onGroupingPersistenceChange={props.onGroupingPersistenceChange}
            /> */}
            </div>
          </Grid>
          <Grid ref={chartElemRef} className='Params__chart__container' item>
            {!!highPlotData?.[0]?.data?.length && (
              <ChartPanel
                ref={chartPanelRef}
                chartType={ChartTypeEnum.HighPlot}
                data={highPlotData}
                focusedState={focusedState}
                onActivePointChange={onActivePointChange}
                tooltipContent={tooltipContent}
                chartProps={[
                  {
                    curveInterpolation,
                    isVisibleColorIndicator,
                  },
                ]}
                controls={
                  <Controls
                    onCurveInterpolationChange={onCurveInterpolationChange}
                    curveInterpolation={curveInterpolation}
                    isVisibleColorIndicator={isVisibleColorIndicator}
                    onColorIndicatorChange={onColorIndicatorChange}
                  />
                }
              />
            )}
          </Grid>
          <div ref={resizeElemRef}>
            <div className='Metrics__resize'>
              <MoreHorizIcon />
            </div>
          </div>
        </Grid>
      </section>
    </div>
  );
};

export default React.memo(Params);
