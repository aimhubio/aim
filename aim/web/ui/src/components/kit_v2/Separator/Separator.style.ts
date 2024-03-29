import * as Separator from '@radix-ui/react-separator';

import { styled } from 'config/stitches';

export const SeparatorRoot: any = styled(Separator.Root, {
  '&[data-orientation=horizontal]': { height: 1, width: '100%' },
  '&[data-orientation=vertical]': { height: 'inherit', width: 1 },
});
