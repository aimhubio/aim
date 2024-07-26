import * as Tooltip from '@radix-ui/react-tooltip';

import { styled } from 'config/stitches';
import {
  slideDownAndFade,
  slideLeftAndFade,
  slideRightAndFade,
  slideUpAndFade,
} from 'config/stitches/animations';

const TooltipContent = styled(Tooltip.Content, {
  borderRadius: 4,
  p: '$4 $5',
  maxWidth: 400,
  fontSize: '$3',
  border: '1px solid $colors$border-bgborder-airly-opacity',
  wordBreak: 'break-word',
  lineHeight: 1,
  backgroundColor: 'white',
  bs: '$moderate',
  zIndex: 1000,
  userSelect: 'none',
  animationDuration: '300ms',
  animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
  willChange: 'transform, opacity',
  '&[data-state="delayed-open"]': {
    '&[data-side="top"]': { animationName: slideDownAndFade },
    '&[data-side="right"]': { animationName: slideLeftAndFade },
    '&[data-side="bottom"]': { animationName: slideUpAndFade },
    '&[data-side="left"]': { animationName: slideRightAndFade },
  },
  variants: {
    colorPalette: {
      info: {
        bc: 'white',
      },
      success: {
        bc: '$background-default-success-plain',
        color: 'white',
      },
      warning: {
        bc: '$background-default-warning-plain',
        color: 'white',
      },
      danger: {
        bc: '$background-default-danger-plain',
        color: 'white',
      },
    },
  },
});

const TooltipArrow = styled(Tooltip.Arrow, {
  fill: 'white',
});

export { TooltipContent, TooltipArrow };
