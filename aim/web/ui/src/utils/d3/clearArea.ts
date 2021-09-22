import * as d3 from 'd3';

import { IClearAreaProps } from 'types/utils/d3/clearArea';

function clearArea(props: IClearAreaProps): void {
  if (!props.visAreaRef?.current) {
    return;
  }

  const area = d3.select(props.visAreaRef.current);
  if (area) {
    area.selectAll('*').remove();
    area.attr('style', null);
  }
}

export default clearArea;
