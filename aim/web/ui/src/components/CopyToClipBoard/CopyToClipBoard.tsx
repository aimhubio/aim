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
  const { onCopy, copied } = useCopy(copyContent ?? contentRef);

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
