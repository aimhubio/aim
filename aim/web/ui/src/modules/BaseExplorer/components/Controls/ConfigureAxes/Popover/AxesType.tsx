import React from 'react';

import { Text, ToggleButton } from 'components/kit';

import { ScaleEnum } from 'utils/d3';

import { IAxesTypeProps } from './index';

function AxesType(props: IAxesTypeProps) {
  const {
    visualizationName,
    engine: { visualizations },
    axesTypeConfig,
  } = props;
  const vizEngine = visualizations[visualizationName];
  const updateAxesProps = vizEngine.controls.axesProperties.methods.update;

  const updateAxesScaleType = React.useCallback(
    (type) => {
      updateAxesProps({
        axesScaleType: { ...axesTypeConfig, ...type },
      });
    },
    [updateAxesProps, axesTypeConfig],
  );

  const handleScaleChange = React.useCallback(
    (val: string | number, id: any) => {
      updateAxesScaleType({ [id]: val });
    },
    [updateAxesScaleType],
  );

  return (
    <div className='AxesType'>
      <Text size={12} tint={50} component='p' className='AxesType__subtitle'>
        Select Axes Scale:
      </Text>
      <div className='AxesType__select'>
        <ToggleButton
          title='X-axis scale:'
          id='xAxis'
          value={axesTypeConfig.xAxis}
          leftValue={ScaleEnum.Linear}
          rightValue={ScaleEnum.Log}
          leftLabel='Linear'
          rightLabel='Log'
          onChange={handleScaleChange}
        />
      </div>
      <div className='AxesType__select'>
        <ToggleButton
          title='Y-axis scale:'
          id='yAxis'
          value={axesTypeConfig.yAxis}
          leftValue={ScaleEnum.Linear}
          rightValue={ScaleEnum.Log}
          leftLabel='Linear'
          rightLabel='Log'
          onChange={handleScaleChange}
        />
      </div>
    </div>
  );
}

export default React.memo(AxesType);
