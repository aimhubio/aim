import * as d3 from 'd3';

import { IClearArea } from '../../types/utils/d3/clearArea';

function clearArea(props: IClearArea): void {
  if (!props?.visRef?.current) {
    return;
  }

  const area = d3.select(props.visRef.current);
  area.selectAll('*').remove();
  area.attr('style', null);
}

export default clearArea;
