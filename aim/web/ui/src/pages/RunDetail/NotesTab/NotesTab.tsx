import React from 'react';

import { Editor } from '@toast-ui/react-editor';

import usePanelResize from 'hooks/resize/usePanelResize';

import '@toast-ui/editor/dist/toastui-editor.css';
import './NotesTab.scss';

function NotesTab() {
  const editorRef: any = React.useRef();
  const wrapperRef = React.useRef<any>();
  const leftPanelRef = React.useRef<any>();
  const rightPanelRef = React.useRef<any>();
  const resizeElemRef = React.useRef<any>();
  const frameRef = React.useRef<number>();
  const panelRef = React.useRef<any>();

  const handleClick = () => {
    editorRef.current.getInstance().exec('Bold');
  };

  React.useEffect(() => {
    resizeElemRef.current = document.querySelector(
      '.toastui-editor-md-splitter',
    );
    leftPanelRef.current = document.querySelector('.toastui-editor');
    rightPanelRef.current = document.querySelector(
      '.toastui-editor-md-preview',
    );
    resizeElemRef.current.addEventListener('mousedown', handleResize);
    panelRef.current = document.querySelector(
      '.RunDetail__runDetailContainer__tabPanel',
    );
  }, [editorRef.current]);

  function handleResize() {
    document.addEventListener('mousemove', startResize);
    document.addEventListener('mouseup', endResize);
  }

  function startResize(event: any) {
    wrapperRef.current.style.userSelect = 'none';
    resizeElemRef.current.style.background = '#89b9f2';
    wrapperRef.current.style.cursor = 'col-resize';
    if (leftPanelRef.current && rightPanelRef.current && wrapperRef.current) {
      const containerWidth: number =
        wrapperRef.current.getBoundingClientRect().width;
      const width: number =
        event.pageX -
        panelRef.current.offsetLeft -
        wrapperRef.current.offsetLeft;
      leftPanelRef.current.style.width = `${width}px`;
      rightPanelRef.current.style.width = `${containerWidth - width}px`;
    }
  }

  function endResize() {
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
  return (
    <section ref={wrapperRef} className='NotesTab'>
      <div className='NotesTab__Editor'>
        <Editor
          previewStyle='vertical'
          initialEditType='markdown'
          height='calc(100vh - 146px)'
          ref={editorRef}
        />
      </div>
    </section>
  );
}

NotesTab.displayName = 'NotesTab';

export default React.memo(NotesTab);
