import React from 'react';

export default function useNotesResizePanel(wrapperRef: any, editorRef: any) {
  const leftPanelRef = React.useRef<any>();
  const rightPanelRef = React.useRef<any>();
  const resizeElemRef = React.useRef<any>();
  const frameRef = React.useRef<number>();

  React.useEffect(() => {
    if (editorRef.current) {
      resizeElemRef.current = wrapperRef.current.querySelector(
        '.toastui-editor-md-splitter',
      );
      leftPanelRef.current = editorRef.current.editorInst.mdEditor.el;
      rightPanelRef.current = editorRef.current.editorInst.preview.el;
      resizeElemRef.current.addEventListener('mousedown', handleResize);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorRef.current]);

  function handleResize() {
    document.addEventListener('mousemove', startResize);
    document.addEventListener('mouseup', endResize);
  }

  function startResize(event: any): void {
    wrapperRef.current.style.userSelect = 'none';
    resizeElemRef.current.style.background = '#89b9f2';
    wrapperRef.current.style.cursor = 'col-resize';

    if (leftPanelRef.current && rightPanelRef.current && wrapperRef.current) {
      const containerWidth: number =
        wrapperRef.current.getBoundingClientRect().width;
      const width: number =
        event.pageX - wrapperRef.current.getBoundingClientRect().left;
      leftPanelRef.current.style.width = `${width}px`;
      rightPanelRef.current.style.width = `${containerWidth - width}px`;
    }
  }

  function endResize(): void {
    if (frameRef.current) {
      window.cancelAnimationFrame(frameRef.current);
    }
    if (wrapperRef?.current && resizeElemRef?.current) {
      wrapperRef.current.style.userSelect = 'unset';
      wrapperRef.current.style.cursor = 'unset';
      resizeElemRef.current.style.background = '#e8f1fc';
      document.removeEventListener('mousemove', startResize);
    }
  }
}
