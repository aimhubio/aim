import * as React from 'react';

import { AimFlatObjectBase } from 'types/core/AimObjects';

import { IBoxProps } from './';

function Box(props: IBoxProps<AimFlatObjectBase>) {
  const {
    engine,
    boxId,
    boxIndex,
    boxItems,
    visualizationName,
    component: BoxContent,
  } = props;
  const vizEngine = engine.visualizations[visualizationName];
  const boxConfig = engine.useStore(vizEngine.box.stateSelector);
  const firstItem = boxItems[0];

  return firstItem ? (
    <div className='BoxWrapper' style={{ ...boxConfig, ...firstItem.style }}>
      <div className='BoxWrapper__box'>
        {BoxContent && (
          <BoxContent
            key={boxId}
            index={boxIndex}
            id={boxId}
            data={boxItems}
            engine={engine}
            style={firstItem.style}
            visualizationName={visualizationName}
          />
        )}
      </div>
    </div>
  ) : null;
}

export default React.memo<IBoxProps<AimFlatObjectBase>>(Box);
