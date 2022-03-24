import React from 'react';

import { Editor } from '@toast-ui/react-editor';

import { Button } from 'components/kit';

import '@toast-ui/editor/dist/toastui-editor.css';
import './NotesTab.scss';

function NotesTab() {
  const editorRef = React.useRef<Editor | any>(null);
  const wrapperRef = React.useRef<any>();
  const leftPanelRef = React.useRef<any>();
  const rightPanelRef = React.useRef<any>();
  const resizeElemRef = React.useRef<any>();
  const frameRef = React.useRef<number>();
  const panelRef = React.useRef<any>();

  React.useEffect(() => {
    resizeElemRef.current = document.querySelector(
      '.toastui-editor-md-splitter',
    );
    leftPanelRef.current = document.querySelector('.toastui-editor');
    rightPanelRef.current = document.querySelector(
      '.toastui-editor-md-preview',
    );
    panelRef.current = document.querySelector(
      '.RunDetail__runDetailContainer__tabPanel',
    );
    // const saveBtn = document.createElement('button');
    // saveBtn.addEventListener('click', handleSave)
    // console.log(
    //   editorRef.current.editorInst.defaultUI.insertToolbarItem(
    //     { groupIndex: 2, itemIndex: 3 },
    //     {
    //       name: 'button',
    //       tooltip: 'string',
    //       className: 'string',
    //       command: 'Save',
    //       text: 'string',
    //       el: saveBtn,
    //     },
    //   ) as any,
    // );

    resizeElemRef.current.addEventListener('mousedown', handleResize);
  }, [editorRef.current]);

  function handleSave() {
    console.log('sadasdasd');
  }
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

  function handleChange(e: any) {
    console.log(e);
  }
  return (
    <section ref={wrapperRef} className='NotesTab'>
      <div className='NotesTab__Editor'>
        <Editor
          previewStyle='vertical'
          initialEditType='markdown'
          height='calc(100vh - 146px)'
          ref={editorRef}
          onChange={handleChange}
        />
        <Button
          variant='contained'
          size='small'
          className='NotesTab__Editor__saveBtn'
        >
          Save
        </Button>
      </div>
    </section>
  );
}

NotesTab.displayName = 'NotesTab';

export default React.memo(NotesTab);
