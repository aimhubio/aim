import React from 'react';

import { Tooltip } from '@material-ui/core';
import { IconClipboard, IconClipboardCheck } from '@tabler/icons-react';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import { IconButton } from 'components/kit_v2';

import { useCopy } from 'hooks/useCopy';

import { ICopyToClipBoardProps } from 'types/components/CopyToClipBoard/CopyToClipBoard';

function CopyToClipboard({
  contentRef,
  showSuccessDelay = 1500,
  className = '',
  copyContent = null,
  iconSize = 'md',
}: ICopyToClipBoardProps): React.FunctionComponentElement<ICopyToClipBoardProps> {
  const { onCopy, copied, setCopied } = useCopy(copyContent ?? contentRef);

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
          <IconButton
            icon={copied ? <IconClipboardCheck /> : <IconClipboard />}
            css={copied ? { transition: 'unset' } : {}}
            color={copied ? 'success' : 'secondary'}
            size={iconSize}
            variant={copied ? 'static' : 'ghost'}
          />
        </span>
      </Tooltip>
    </ErrorBoundary>
  );
}

CopyToClipboard.displayName = 'CopyToClipBoard';

export default React.memo<ICopyToClipBoardProps>(CopyToClipboard);
