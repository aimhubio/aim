import React from 'react';
import { ResizeModeEnum } from 'config/enums/tableEnums';

function usePanelResize(
  wrapperRef: React.MutableRefObject<HTMLElement | any>,
  topPanelRef: React.MutableRefObject<HTMLElement | any>,
  bottomPanelRef: React.MutableRefObject<HTMLElement | any>,
  resizeElemRef: React.MutableRefObject<HTMLElement | any>,
  resizeMode: ResizeModeEnum,
) {
  const [panelResizing, setPanelResizing] = React.useState<boolean>(false);

  const handleResize = React.useCallback(() => {
    document.addEventListener('mousemove', startResize);
    document.addEventListener('mouseup', endResize);
  }, []);

  const startResize = React.useCallback((event: MouseEvent): void => {
    wrapperRef.current.style.userSelect = 'none';
    wrapperRef.current.style.cursor = 'row-resize';
    requestAnimationFrame(() => {
      if (bottomPanelRef.current && topPanelRef.current && wrapperRef.current) {
        setPanelResizing(true);
        const containerHeight: number =
          bottomPanelRef.current.getBoundingClientRect()?.height +
          topPanelRef.current.getBoundingClientRect()?.height;

        const searchBarHeight: number =
          wrapperRef.current.getBoundingClientRect()?.height - containerHeight;

        const height: number = event.clientY - searchBarHeight;

        const flex: number = height / containerHeight;
        if (topPanelRef.current && bottomPanelRef.current) {
          topPanelRef.current.style.flex = `${flex} 1 0`;
          bottomPanelRef.current.style.flex = `${1 - flex} 1 0`;
        }
      }
    });
  }, []);

  const endResize = React.useCallback(() => {
    setPanelResizing(false);
    wrapperRef.current.style.userSelect = 'unset';
    wrapperRef.current.style.cursor = 'unset';
    document.removeEventListener('mousemove', startResize);
  }, []);

  React.useEffect(() => {
    resizeElemRef.current.addEventListener('mousedown', handleResize);
    handleResizeModeChange(resizeMode);
    return () => {
      setPanelResizing(false);
      resizeElemRef.current?.removeEventListener('mousedown', handleResize);
      document.removeEventListener('mouseup', endResize);
    };
  }, []);

  React.useEffect(() => {
    handleResizeModeChange(resizeMode);
  }, [resizeMode]);

  function handleResizeModeChange(mode: ResizeModeEnum) {
    if (topPanelRef.current && bottomPanelRef.current) {
      switch (mode) {
        case ResizeModeEnum.Hide:
          topPanelRef.current.style.flex = '1 1 100%';
          bottomPanelRef.current.style.flex = 'unset';
          break;
        case ResizeModeEnum.Resizable:
          topPanelRef.current.style.flex = '0.5 1 0';
          bottomPanelRef.current.style.flex = '0.5 1 0';
          break;
        case ResizeModeEnum.MaxHeight:
          topPanelRef.current.style.flex = 'unset';
          bottomPanelRef.current.style.flex = '1 1 100%';
          break;
        default:
          break;
      }
    }
  }
  return panelResizing;
}

export default usePanelResize;
