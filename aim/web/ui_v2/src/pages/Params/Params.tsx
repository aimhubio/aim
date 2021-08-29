import React from 'react';
import { Grid } from '@material-ui/core';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';

import Controls from './components/Controls/Controls';
import SelectForm from './components/SelectForm/SelectForm';
import ChartPanel from 'components/ChartPanel/ChartPanel';
import Grouping from 'pages/Metrics/components/Grouping/Grouping';
import AppBar from 'pages/Metrics/components/MetricsBar/MetricsBar';
import { IParamsProps } from 'types/pages/params/Params';
import { ChartTypeEnum } from 'utils/d3';
import './Params.scss';

const Params = ({
  curveInterpolation,
  highPlotData,
  chartPanelRef,
  chartElemRef,
  focusedState,
  isVisibleColorIndicator,
  selectedParamsData,
  wrapperElemRef,
  resizeElemRef,
  tableElemRef,
  groupingData,
  tooltip,
  onCurveInterpolationChange,
  onActivePointChange,
  onColorIndicatorChange,
  onParamsSelectChange,
  onSelectRunQueryChange,
  onGroupingSelectChange,
  onGroupingModeChange,
  onGroupingPaletteChange,
  onGroupingReset,
  onGroupingApplyChange,
  onGroupingPersistenceChange,
  onBookmarkCreate,
  onBookmarkUpdate,
  onResetConfigData,
  onChangeTooltip,
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
          <Grid item>
            <AppBar
              onBookmarkCreate={onBookmarkCreate}
              onBookmarkUpdate={onBookmarkUpdate}
              onResetConfigData={onResetConfigData}
            />
          </Grid>
          <Grid item>
            <div className='Params__SelectForm__Grouping__container'>
              <SelectForm
                selectedParamsData={selectedParamsData}
                onParamsSelectChange={onParamsSelectChange}
                onSelectRunQueryChange={onSelectRunQueryChange}
              />
              <Grouping
                groupingData={groupingData}
                onGroupingSelectChange={onGroupingSelectChange}
                onGroupingModeChange={onGroupingModeChange}
                onGroupingPaletteChange={onGroupingPaletteChange}
                onGroupingReset={onGroupingReset}
                onGroupingApplyChange={onGroupingApplyChange}
                onGroupingPersistenceChange={onGroupingPersistenceChange}
              />
            </div>
          </Grid>
          <Grid ref={chartElemRef} className='Params__chart__container' item>
            {!!highPlotData?.[0]?.data?.length ? (
              <ChartPanel
                ref={chartPanelRef}
                chartType={ChartTypeEnum.HighPlot}
                data={highPlotData}
                focusedState={focusedState}
                onActivePointChange={onActivePointChange}
                tooltip={tooltip}
                chartProps={[
                  {
                    curveInterpolation,
                    isVisibleColorIndicator,
                  },
                ]}
                controls={
                  <Controls
                    curveInterpolation={curveInterpolation}
                    isVisibleColorIndicator={isVisibleColorIndicator}
                    selectOptions={groupingData?.selectOptions}
                    tooltip={tooltip}
                    onCurveInterpolationChange={onCurveInterpolationChange}
                    onColorIndicatorChange={onColorIndicatorChange}
                    onChangeTooltip={onChangeTooltip}
                  />
                }
              />
            ) : (
              <div className='Params__chart__container__emptyBox'>
                Choose Params
              </div>
            )}
          </Grid>
          <div ref={resizeElemRef}>
            <div className='Params__resize'>
              <MoreHorizIcon />
            </div>
          </div>
          <Grid item xs ref={tableElemRef} className='Params__table__container'>
            <div>asdasd</div>
          </Grid>
        </Grid>
      </section>
    </div>
  );
};

export default React.memo(Params);
