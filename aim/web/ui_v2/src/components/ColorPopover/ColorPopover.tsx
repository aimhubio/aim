import React from 'react';
import { Box } from '@material-ui/core';
import ToggleButton from 'components/ToggleButton/ToggleButton';

import styles from './colorPopoverStyle.module.scss';

function ColorPopover(): React.FunctionComponentElement<React.ReactNode> {
  function handleGroupingMode() {}
  function handlePersistence() {}
  return (
    <Box width='25em' className={styles.popover_container}>
      <Box className={styles.popover__header}>
        <h3>Run Color Settings</h3>
      </Box>
      <Box p={0.5}>
        <Box borderRadius={4} border='1px solid #B7B7B7' p={0.5}>
          <h3>Select fields for grouping by color</h3>
        </Box>
        <Box
          display='flex'
          alignItems='center'
          borderRadius={4}
          flexDirection='column'
          border='1px solid #B7B7B7'
          mt={0.5}
          mb={0.5}
          p={0.5}
        >
          <h3>select grouping mode</h3>
          <ToggleButton
            id='groupMode'
            leftLabel='Group'
            rightLabel='Reverse'
            onChange={handleGroupingMode}
          />
        </Box>
        <Box borderRadius={4} border='1px solid #B7B7B7' p={0.5}>
          Advanced options
          <Box>
            <h3>colors persistence:</h3>
            <Box>
              Enable persistent coloring mode so that each item always has the
              same color regardless of its order.
            </Box>
            <Box>
              <ToggleButton
                id='persistence'
                leftLabel='enabled'
                defaultChecked
                onChange={handlePersistence}
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default ColorPopover;
