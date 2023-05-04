import React from 'react';
import * as d3 from 'd3';

import { ISyncHoverStateArgs } from 'types/utils/d3/drawHoverAttributes';

function drawUnableToRender({
  renderArr = [],
  visAreaRef,
  attributesRef,
  readOnly = false,
  syncHoverState,
}: {
  renderArr: { condition: boolean; text?: string }[];
  attributesRef: React.MutableRefObject<any>;
  visAreaRef: React.MutableRefObject<any>;
  readOnly?: boolean;
  syncHoverState?: (args: ISyncHoverStateArgs) => void;
}) {
  const renderItem = renderArr.find((item) => item.condition);

  if (renderItem?.condition && visAreaRef.current && !readOnly) {
    const visArea = d3.select(visAreaRef.current);
    visArea.selectAll('*').remove();
    visArea
      .append('text')
      .classed('unableToDrawText', true)
      .text(renderItem.text || '');

    if (attributesRef.current?.clearHoverAttributes) {
      attributesRef.current.clearHoverAttributes();
    }
    attributesRef.current = {};
    syncHoverState?.({ activePoint: null });
  }
}

export default drawUnableToRender;
