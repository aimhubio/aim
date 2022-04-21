import React from 'react';

import { INoteTooltipProps } from '../NotesTab/types';

function NoteTooltip({ children }: INoteTooltipProps) {
  const ref = React.useRef<any>(null);
  const [mounted, setMounted] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (!mounted) {
      setMounted(true);
    } else {
      const parentNode: HTMLDivElement =
        ref.current.parentNode.parentNode.parentNode;
      if (parentNode.id !== 'notes-toolbar-popover') {
        parentNode.id = 'notes-toolbar-popover';
      }
    }
  }, [mounted]);

  return <div ref={ref}>{children}</div>;
}

export default NoteTooltip;
