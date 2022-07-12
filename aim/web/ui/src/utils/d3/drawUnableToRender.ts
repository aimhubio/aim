import React from 'react';
import * as d3 from 'd3';

function drawUnableToRender({
  renderArr = [],
  visAreaRef,
  attributesRef,
  readOnly = false,
}: {
  renderArr: { condition: boolean; text?: string }[];
  attributesRef: React.MutableRefObject<any>;
  visAreaRef: React.MutableRefObject<any>;
  readOnly?: boolean;
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
  }
}

export default drawUnableToRender;
