import React from 'react';

import { Tooltip } from '@material-ui/core';

import { Button, Icon } from 'components/kit';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { useCopy } from 'hooks/useCopy/useCopy';

import { ICopyToClipBoardProps } from 'types/components/CopyToClipBoard/CopyToClipBoard';

function CopyToClipboard({
  contentRef,
  showSuccessDelay = 1500,
  className = '',
}: ICopyToClipBoardProps): React.FunctionComponentElement<ICopyToClipBoardProps> {
  const { onCopy, copied, setCopied } = useCopy(contentRef);

  React.useEffect(() => {
    if (copied) {
      setTimeout(() => {
        setCopied(false);
      }, showSuccessDelay);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [copied]);

  return (
    <ErrorBoundary>
      <Tooltip title={copied ? 'Copied!' : 'Copy to clipboard'}>
        <span className={className} onClick={onCopy}>
          <Button withOnlyIcon color='secondary' size='medium'>
            {copied ? <Icon name='check' /> : <Icon name='copy' />}
          </Button>
        </span>
      </Tooltip>
    </ErrorBoundary>
  );
}

CopyToClipboard.displayName = 'CopyToClipBoard';

export default React.memo<ICopyToClipBoardProps>(CopyToClipboard);
