import React from 'react';

import {
  Grid,
  GridSize,
  Dialog,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@material-ui/core';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import { CHART_TYPES_CONFIG } from 'components/ChartPanel/config';
import { Button, Icon, Text } from 'components/kit';

import { GRID_SIZE, CHART_GRID_PATTERN } from 'config/charts';

import { IChartGridProps } from '.';

import './ChartGrid.scss';

// Subset value carried by each line at runtime via metric.context.subset.
const SUBSET_CONTEXT_KEY = 'subset';

function getChartSubset(chartData: any): string | undefined {
  const context = chartData?.[0]?.context;
  const subset = context?.[SUBSET_CONTEXT_KEY];
  return subset === undefined || subset === null ? undefined : String(subset);
}

function ChartGrid({
  data,
  chartType,
  chartRefs = [],
  nameKey,
  chartProps,
  readOnly = false,
  syncHoverState,
  resizeMode,
  chartPanelOffsetHeight,
  onMount,
  controls,
}: IChartGridProps): React.FunctionComponentElement<React.ReactNode> {
  const [fullScreenIndex, setFullScreenIndex] = React.useState<number | null>(
    null,
  );
  const [fullScreenChartReady, setFullScreenChartReady] = React.useState(false);
  const fullScreenRef = React.useRef<any>(null);

  React.useEffect(() => {
    if (fullScreenIndex === null) {
      setFullScreenChartReady(false);
      return;
    }
    // wait until the dialog is laid out before mounting the D3 chart,
    // otherwise it draws into a zero-sized container and the curve is missing
    let raf2 = 0;
    const raf1 = window.requestAnimationFrame(() => {
      raf2 = window.requestAnimationFrame(() => setFullScreenChartReady(true));
    });
    return () => {
      window.cancelAnimationFrame(raf1);
      window.cancelAnimationFrame(raf2);
    };
  }, [fullScreenIndex]);

  function getGridSize(dataLength: number, index: number): GridSize {
    return (
      dataLength > 9 ? GRID_SIZE.S : CHART_GRID_PATTERN[dataLength][index]
    ) as GridSize;
  }

  // Group chart panels into foldable sections by metric.context.subset.
  // Only activated when at least two distinct subset values are present,
  // otherwise the charts are rendered as a flat grid (original behaviour).
  const subsetSections = React.useMemo(() => {
    const sections: { subset: string | undefined; indices: number[] }[] = [];
    const byKey: Record<string, number[]> = {};
    data.forEach((chartData: any, index: number) => {
      const subset = getChartSubset(chartData);
      const key = subset ?? '__none__';
      if (!byKey[key]) {
        byKey[key] = [];
        sections.push({ subset, indices: byKey[key] });
      }
      byKey[key].push(index);
    });
    return sections;
  }, [data]);

  const definedSubsetCount = subsetSections.filter(
    (s) => s.subset !== undefined,
  ).length;
  const useSections = definedSubsetCount >= 2;

  function renderChart(globalIndex: number, gridSize: GridSize) {
    const Component = CHART_TYPES_CONFIG[chartType];
    return (
      <Grid
        key={`${globalIndex}-${resizeMode}-${chartPanelOffsetHeight}`}
        item
        className='ChartGrid'
        xs={gridSize}
      >
        <Component
          ref={chartRefs[globalIndex]}
          nameKey={nameKey}
          index={globalIndex}
          {...chartProps[globalIndex]}
          readOnly={readOnly}
          onMount={onMount}
          data={data[globalIndex]}
          syncHoverState={syncHoverState}
          resizeMode={resizeMode}
          onDoubleClick={() => setFullScreenIndex(globalIndex)}
        />
      </Grid>
    );
  }

  const FullScreenComponent =
    fullScreenIndex !== null ? CHART_TYPES_CONFIG[chartType] : null;

  return (
    <ErrorBoundary>
      {useSections ? (
        <div className='ChartGrid__sections'>
          {subsetSections.map((section) => (
            <Accordion
              key={section.subset ?? '__none__'}
              defaultExpanded
              elevation={0}
              square
              className='ChartGrid__section'
              classes={{ expanded: 'ChartGrid__section--expanded' }}
            >
              <AccordionSummary
                expandIcon={<Icon name='arrow-down' />}
                className='ChartGrid__section__summary'
              >
                <Text size={14} weight={600} tint={100}>
                  {section.subset !== undefined
                    ? `${SUBSET_CONTEXT_KEY}: ${section.subset}`
                    : 'Other'}
                </Text>
                <Text size={12} tint={50} className='ChartGrid__section__count'>
                  {section.indices.length} chart
                  {section.indices.length > 1 ? 's' : ''}
                </Text>
              </AccordionSummary>
              <AccordionDetails className='ChartGrid__section__details'>
                {section.indices.map((globalIndex, localIndex) =>
                  renderChart(
                    globalIndex,
                    getGridSize(section.indices.length, localIndex),
                  ),
                )}
              </AccordionDetails>
            </Accordion>
          ))}
        </div>
      ) : (
        data.map((_chartData: any, index: number) =>
          renderChart(index, getGridSize(data.length, index)),
        )
      )}
      {FullScreenComponent && fullScreenIndex !== null && (
        <Dialog
          open
          onClose={() => setFullScreenIndex(null)}
          maxWidth='lg'
          fullWidth
          transitionDuration={0}
          classes={{ paper: 'ChartGrid__fullScreenDialog' }}
        >
          <Button
            onClick={() => setFullScreenIndex(null)}
            size='small'
            withOnlyIcon
            className='ChartGrid__fullScreenDialog__closeBtn'
          >
            <Icon name='close' />
          </Button>
          <div className='ChartGrid__fullScreenDialog__body'>
            <div className='ChartGrid__fullScreenDialog__chart'>
              {fullScreenChartReady && (
                <FullScreenComponent
                  ref={fullScreenRef}
                  nameKey={nameKey}
                  index={fullScreenIndex}
                  {...chartProps[fullScreenIndex]}
                  id={`fullscreen-${fullScreenIndex}`}
                  readOnly={readOnly}
                  data={data[fullScreenIndex]}
                  syncHoverState={syncHoverState}
                  resizeMode={resizeMode}
                />
              )}
            </div>
            {controls && (
              <div className='ChartGrid__fullScreenDialog__controls ScrollBar__hidden'>
                {controls}
              </div>
            )}
          </div>
        </Dialog>
      )}
    </ErrorBoundary>
  );
}

ChartGrid.displayName = 'ChartGrid';

export default React.memo<IChartGridProps>(ChartGrid);
