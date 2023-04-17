import React from 'react';

import { ICopyToClipBoardProps } from 'types/components/CopyToClipBoard/CopyToClipBoard';

import { onCopyToClipBoard } from 'utils/onCopyToClipBoard';

export function useCopy(
  contentRef: ICopyToClipBoardProps['contentRef'] | string,
  showSuccessDelay: number = 1500,
) {
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (copied) {
      setTimeout(() => {
        setCopied(false);
      }, showSuccessDelay);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [copied]);

  const onCopy = React.useCallback(() => {
    const text: string =
      typeof contentRef === 'string'
        ? contentRef
        : contentRef?.current?.innerText?.trim('');
    onCopyToClipBoard(text, copied);
    setCopied(true);
  }, [contentRef, copied]);

  return { onCopy, copied, setCopied };
}
