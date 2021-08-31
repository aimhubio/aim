import React from 'react';
import copy from 'copy-to-clipboard';
import { ICopyToClipBoardProps } from 'types/components/CopyToClipBoard/CopyToClipBoard';

import copyIcon from 'assets/icons/copy.svg';

function CopyToClipboard({
  contentRef,
  showSuccessDelay = 1500,
  className = '',
}: ICopyToClipBoardProps): React.FunctionComponentElement<ICopyToClipBoardProps> {
  const [showCopiedIcon, setShowCopiedIcon] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (showCopiedIcon) {
      setTimeout(() => {
        setShowCopiedIcon(false);
      }, showSuccessDelay);
    }
  }, [showCopiedIcon]);

  const onCopy = React.useCallback(() => {
    if (contentRef.current && !showCopiedIcon) {
      const copied = copy(contentRef.current.outerText);
      if (copied) {
        setShowCopiedIcon(true);
      }
    }
  }, [contentRef, showCopiedIcon]);

  return (
    <span className={className} onClick={onCopy}>
      {showCopiedIcon ? (
        <span style={{ color: 'green', fontSize: 12 }}>Copied !</span>
      ) : (
        <img src={copyIcon} alt='copy' />
      )}
    </span>
  );
}

CopyToClipboard.displayName = 'CopyToClipBoard';

export default React.memo<ICopyToClipBoardProps>(CopyToClipboard);
