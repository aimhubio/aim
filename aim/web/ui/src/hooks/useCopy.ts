import React from 'react';

import { ICopyToClipBoardProps } from 'types/components/CopyToClipBoard/CopyToClipBoard';

import { onCopyToClipBoard } from 'utils/onCopyToClipBoard';

export function useCopy(contentRef: ICopyToClipBoardProps['contentRef']) {
  const [copied, setCopied] = React.useState(false);
  const onCopy = React.useCallback(() => {
    const text: string = contentRef.current?.innerText?.trim('');
    onCopyToClipBoard(text, copied);
    setCopied(true);
  }, [contentRef, copied]);

  return { onCopy, copied, setCopied };
}
