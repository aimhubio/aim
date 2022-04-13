import React from 'react';

import { Tooltip } from '@material-ui/core';

import { Button, Icon } from 'components/kit';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { ICopyToClipBoardProps } from 'types/components/CopyToClipBoard/CopyToClipBoard';

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showCopiedIcon]);

  const onCopy = React.useCallback(() => {
    if (contentRef.current && !showCopiedIcon) {
      navigator.clipboard
        .writeText(contentRef.current.innerText.trim(''))
        .then(function () {
          setShowCopiedIcon(true);
        })
        .catch();
    }
  }, [contentRef, showCopiedIcon]);

  return (
    <ErrorBoundary>
      <Tooltip title={showCopiedIcon ? 'Copied!' : 'Copy to clipboard'}>
        <span className={className} onClick={onCopy}>
          <Button withOnlyIcon color='secondary' size='medium'>
            {showCopiedIcon ? <Icon name='check' /> : <Icon name='copy' />}
          </Button>
        </span>
      </Tooltip>
    </ErrorBoundary>
  );
}

CopyToClipboard.displayName = 'CopyToClipBoard';

export default React.memo<ICopyToClipBoardProps>(CopyToClipboard);
