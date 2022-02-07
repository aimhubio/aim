import React from 'react';

import { ResizeModeEnum } from 'config/enums/tableEnums';

import { ITableConfig } from 'types/services/models/explorer/createAppModel';

function usePanelResize(
  wrapperRef: React.MutableRefObject<HTMLElement | any>,
  topPanelRef: React.MutableRefObject<HTMLElement | any>,
  bottomPanelRef: React.MutableRefObject<HTMLElement | any>,
  resizeElemRef: React.MutableRefObject<HTMLElement | any>,
  tableConfig: ITableConfig | undefined,
  onResizeEnd: (height: string) => void,
) {
  const [panelResizing, setPanelResizing] = React.useState<boolean>(false);
  const frameRef = React.useRef<number>();

  const startResize = React.useCallback(
    (event: MouseEvent): void => {
      if (tableConfig?.resizeMode !== ResizeModeEnum.Hide) {
        wrapperRef.current.style.userSelect = 'none';
        wrapperRef.current.style.cursor = 'row-resize';
        frameRef.current = window.requestAnimationFrame(() => {
          if (
            bottomPanelRef.current &&
            topPanelRef.current &&
            wrapperRef.current
          ) {
            setPanelResizing(true);
            const containerHeight: number =
              bottomPanelRef.current.getBoundingClientRect()?.height +
              topPanelRef.current.getBoundingClientRect()?.height;

            const searchBarHeight: number =
              wrapperRef.current.getBoundingClientRect()?.height -
              containerHeight;

            const height: number = event.clientY - searchBarHeight;

            const flex: number = height / containerHeight;
            if (topPanelRef.current && bottomPanelRef.current) {
              topPanelRef.current.style.flex = `${flex} 1 0`;
              bottomPanelRef.current.style.flex = `${1 - flex} 1 0`;
            }
          }
        });
      }
    },
    [bottomPanelRef, topPanelRef, wrapperRef, tableConfig?.resizeMode],
  );

  const endResize = React.useCallback(() => {
    if (frameRef.current) {
      window.cancelAnimationFrame(frameRef.current);
    }
    setPanelResizing(false);
    wrapperRef.current.style.userSelect = 'unset';
    wrapperRef.current.style.cursor = 'unset';
    document.removeEventListener('mousemove', startResize);
    onResizeEnd(topPanelRef.current.style.flex.split(' ')[0]);
  }, [onResizeEnd, startResize, topPanelRef, wrapperRef]);

  const handleResize = React.useCallback(() => {
    document.addEventListener('mousemove', startResize);
    document.addEventListener('mouseup', endResize);
  }, [startResize, endResize]);

  const handleResizeModeChange = React.useCallback(
    (mode: ResizeModeEnum) => {
      const tableHeight: number = tableConfig ? +tableConfig.height : 0.5;
      if (topPanelRef.current && bottomPanelRef.current) {
        switch (mode) {
          case ResizeModeEnum.Hide:
            topPanelRef.current.style.flex = '1 1 100%';
            bottomPanelRef.current.style.flex = 'unset';
            break;
          case ResizeModeEnum.Resizable:
            topPanelRef.current.style.flex = `${tableHeight} 1 0`;
            bottomPanelRef.current.style.flex = `${1 - tableHeight} 1 0`;
            break;
          case ResizeModeEnum.MaxHeight:
            topPanelRef.current.style.flex = 'unset';
            bottomPanelRef.current.style.flex = '1 1 100%';
            break;
          default:
            break;
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [bottomPanelRef, tableConfig?.height, topPanelRef],
  );

  React.useEffect(() => {
    resizeElemRef.current.addEventListener('mousedown', handleResize);
    tableConfig && handleResizeModeChange(tableConfig?.resizeMode);
    return () => {
      setPanelResizing(false);
      resizeElemRef.current?.removeEventListener('mousedown', handleResize);
      document.removeEventListener('mouseup', endResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    endResize,
    handleResize,
    handleResizeModeChange,
    resizeElemRef.current,
    tableConfig?.resizeMode,
  ]);

  React.useEffect(() => {
    tableConfig && handleResizeModeChange(tableConfig?.resizeMode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableConfig?.resizeMode, handleResizeModeChange]);

  return panelResizing;
}

export default usePanelResize;
