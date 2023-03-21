import React from 'react';

import * as TooltipPrimitive from '@radix-ui/react-tooltip';

import { TooltipArrow, TooltipContent } from './Tooltip.style';
import { ITooltipProps } from './Tooltip.d';

/**
 * @description Tooltip component is for displaying a tooltip
 * Tooltip component params
 * @param {React.ReactNode} children - React children
 * @param {string} content - Tooltip content
 * @param {number} delayDuration - Delay duration
 * @param {boolean} disableHoverableContent - Disable hoverable content
 * @param {number} skipDelayDuration - Skip delay duration
 * @param {React.ReactNode} contentProps - Content props
 * @returns {React.FunctionComponentElement<React.ReactNode>}
 * @constructor
 * @example
 * <Tooltip
 *  content='Tooltip content'
 *  delayDuration={700}
 *  disableHoverableContent={false}
 *  skipDelayDuration={300}
 * >
 * <Button>Open tooltip</Button>
 * </Tooltip>
 */
function Tooltip({
  content,
  delayDuration = 700,
  disableHoverableContent = false,
  skipDelayDuration = 300,
  contentProps = {},
  children,
  ...props
}: ITooltipProps): React.FunctionComponentElement<React.ReactNode> {
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

Tooltip.displayName = 'Tooltip';
export default React.memo(Tooltip);
