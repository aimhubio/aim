import * as d3 from 'd3';

import { ZoomEnum } from 'components/ZoomInPopover/ZoomInPopover';

import { IDrawBrushArgs } from 'types/utils/d3/drawBrush';

import getAxisScale from './getAxisScale';

function drawBrush(args: IDrawBrushArgs): void {
  const {
    index,
    plotBoxRef,
    plotNodeRef,
    visBoxRef,
    axesRef,
    attributesRef,
    linesRef,
    svgNodeRef,
    axesScaleType,
    min,
    max,
    zoom,
    onZoomChange,
    readOnly,
  } = args;

  if (!plotNodeRef.current) {
    return;
  }

  const brush = d3
    .brush()
    .extent([
      [0, 0],
      [plotBoxRef.current.width, plotBoxRef.current.height],
    ])
    .on('end', handleBrushChange);

  if (zoom?.active && !readOnly) {
    plotNodeRef.current.append('g').call(brush).attr('class', 'brush');
  }

  function handleZoomIn(
    xValues: [number, number],
    yValues: [number, number],
  ): void {
    const { width, height, margin } = visBoxRef.current;

    // updating Scales domain
    attributesRef.current.xScale
      .domain(xValues)
      .range([0, width - margin.left - margin.right]);

    attributesRef.current.yScale
      .domain(yValues)
      .range([height - margin.top - margin.bottom, 0]);

    // updating axes with new Scales
    axesRef.current.updateXAxis(attributesRef.current.xScale);
    axesRef.current.updateYAxis(attributesRef.current.yScale);

    linesRef.current.updateScales?.(
      attributesRef.current.xScale,
      attributesRef.current.yScale,
    );

    linesRef.current.updateAggregatedAreasScales?.(
      attributesRef.current.xScale,
      attributesRef.current.yScale,
    );

    linesRef.current.updateAggregatedLinesScales?.(
      attributesRef.current.xScale,
      attributesRef.current.yScale,
    );

    attributesRef.current.updateScales?.(
      attributesRef.current.xScale,
      attributesRef.current.yScale,
    );
    attributesRef.current.updateFocusedChart?.();
  }

  // This remove the grey brush area as soon as the selection has been done
  function removeBrush() {
    plotNodeRef.current.select('.brush').call(brush.move, null);
  }

  // This event firing after brush selection ends
  function handleBrushChange(event: d3.D3BrushEvent<d3.BrushSelection>): void {
    const extent: d3.BrushSelection | any = event.selection;
    if (!extent) {
      return;
    } else if (
      extent[1][0] - extent[0][0] < 5 ||
      extent[1][1] - extent[0][1] < 5
    ) {
      removeBrush();
    } else {
      // inverting pixels to x,y values
      const left: number = attributesRef.current.xScale.invert(extent[0][0]);
      const right: number = attributesRef.current.xScale.invert(extent[1][0]);

      const top: number = attributesRef.current.yScale.invert(extent[0][1]);
      const bottom: number = attributesRef.current.yScale.invert(extent[1][1]);

      const [xMin, xMax]: number[] = attributesRef.current.xScale.domain();
      const [yMin, yMax]: number[] = attributesRef.current.yScale.domain();

      const xValues: [number, number] | null =
        extent[1][0] - extent[0][0] < 5
          ? null
          : [left < xMin ? xMin : left, right > xMax ? xMax : right];

      const yValues: [number, number] | null =
        extent[1][1] - extent[0][1] < 5
          ? null
          : [bottom < yMin ? yMin : bottom, top > yMax ? yMax : top];

      if (xValues && yValues) {
        handleZoomIn?.(xValues, yValues);
        if (typeof onZoomChange === 'function' && zoom) {
          onZoomChange({
            active: zoom.mode !== ZoomEnum.SINGLE,
            history: [
              ...zoom.history,
              {
                index,
                xValues,
                yValues,
              },
            ],
          });
        }
      }
    }
    svgNodeRef.current.on('dblclick', handleZoomOut);
    removeBrush();
  }

  function handleZoomOut(event: Event): void {
    const { width, height, margin } = visBoxRef.current;

    const xScale = getAxisScale({
      domainData: [min.x, max.x],
      rangeData: [0, width - margin.left - margin.right],
      scaleType: axesScaleType.xAxis,
    });
    const yScale = getAxisScale({
      domainData: [min.y, max.y],
      rangeData: [height - margin.top - margin.bottom, 0],
      scaleType: axesScaleType.yAxis,
    });
    // setting axes to initial state
    axesRef.current.updateXAxis(xScale);
    axesRef.current.updateYAxis(yScale);

    // setting scales and lines to initial state
    linesRef.current.updateScales?.(xScale, yScale);
    linesRef.current.updateAggregatedAreasScales?.(xScale, yScale);
    linesRef.current.updateAggregatedLinesScales?.(xScale, yScale);

    attributesRef.current.updateScales?.(xScale, yScale);
    attributesRef.current.updateFocusedChart?.();
  }

  if (zoom?.history?.length) {
    const chartZoomHistory = zoom.history.filter(
      (item) => item.index === index,
    );
    const lastHistoryState = chartZoomHistory[chartZoomHistory.length - 1];
    if (lastHistoryState) {
      handleZoomIn(lastHistoryState.xValues, lastHistoryState.yValues);
    }
  }
}

export default drawBrush;
