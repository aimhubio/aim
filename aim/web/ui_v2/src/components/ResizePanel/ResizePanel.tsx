import React from 'react';
import Icon from 'components/Icon/Icon';

import { ResizeModeEnum } from 'config/enums/tableEnums';
import ResizeModeActions from 'components/ResizeModeActions/ResizeModeActions';
import { IResizePanelProps } from 'types/components/ResizePanel/ResizePanel';

import './ResizePanel.scss';

function ResizePanel({
  panelResizing,
  resizeElemRef,
  resizeMode,
  onTableResizeModeChange,
}: IResizePanelProps): React.FunctionComponentElement<React.ReactNode> | null {
  return (
    <div
      ref={resizeElemRef}
      className={`ResizePanel${
        resizeMode === ResizeModeEnum.Hide && !panelResizing
          ? '__fullHeight'
          : resizeMode !== ResizeModeEnum.Resizable
          ? '__hidden'
          : ''
      } ${panelResizing ? 'resizing' : ''}`}
    >
      {resizeMode === ResizeModeEnum.Hide ? (
        <ResizeModeActions
          resizeMode={resizeMode}
          onTableResizeModeChange={onTableResizeModeChange}
        />
      ) : (
        <Icon name='more-horizontal' />
      )}
    </div>
  );
}

export default React.memo(ResizePanel);
