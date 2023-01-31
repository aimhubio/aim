import React from 'react';

import * as TooltipPrimitive from '@radix-ui/react-tooltip';

import { TooltipArrow, TooltipContent } from './Tooltip.style';
import { ITooltipProps } from './Tooltip.d';

function Tooltip({
  children,
  content,
  delayDuration = 700,
  disableHoverableContent = false,
  skipDelayDuration = 300,
  contentProps = {},
  ...props
}: ITooltipProps) {
  return (
    <TooltipPrimitive.Provider
      delayDuration={delayDuration}
      disableHoverableContent={disableHoverableContent}
      skipDelayDuration={skipDelayDuration}
    >
      <TooltipPrimitive.Root {...props}>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipContent
            data-testid='tooltip-content'
            sideOffset={5}
            {...contentProps}
          >
            {content}
            <TooltipArrow />
          </TooltipContent>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}

export default React.memo(Tooltip);
