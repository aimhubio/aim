import React from 'react';

import { Editor } from '@toast-ui/react-editor';

import '@toast-ui/editor/dist/toastui-editor.css';

function NotesTab() {
  const editorRef: any = React.useRef();

  const handleClick = () => {
    editorRef.current.getInstance().exec('Bold');
  };

  return (
    <>
      <Editor
        previewStyle='vertical'
        height='400px'
        initialEditType='markdown'
        initialValue='hello'
        ref={editorRef}
      />
    </>
  );
}

NotesTab.displayName = 'NotesTab';

export default React.memo(NotesTab);
