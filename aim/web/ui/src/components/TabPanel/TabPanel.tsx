import React, { memo } from 'react';
import { Box } from '@material-ui/core';

import { ITabPanelProps } from 'types/components/TabPanel/TabPanel';

function TabPanel({
  children,
  value,
  index,
  className,
}: ITabPanelProps): React.FunctionComponentElement<React.ReactNode> {
  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`wrapped-tabpanel-${index}`}
      aria-labelledby={`wrapped-tab-${index}`}
      className={className}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

export default memo(TabPanel);
