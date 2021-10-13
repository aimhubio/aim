import React from 'react';
import ImagesSet from 'components/ImagesSet/ImagesSet';

import './ImagesPanel.scss';
import { Box, Slider } from '@material-ui/core';

function ImagesPanel({
  imagesData,
  stepSlice,
  indexSlice,
  onIndexSliceChange,
  onStepSliceChange,
}: any): React.FunctionComponentElement<React.ReactNode> {
  return imagesData ? (
    <div className='ImagesPanel'>
      <div className='ImagesPanel__slidersContainer'>
        <Box sx={{ width: 300 }}>
          <Slider
            value={stepSlice}
            onChange={onStepSliceChange}
            valueLabelDisplay='auto'
            getAriaValueText={(value) => `${value}`}
          />
        </Box>
        <Box sx={{ width: 300 }}>
          <Slider
            value={indexSlice}
            onChange={onIndexSliceChange}
            valueLabelDisplay='auto'
            getAriaValueText={(value) => `${value}`}
          />
        </Box>
      </div>
      <ImagesSet data={imagesData} title={'root'} />
    </div>
  ) : (
    <div></div>
  );
}

export default ImagesPanel;
