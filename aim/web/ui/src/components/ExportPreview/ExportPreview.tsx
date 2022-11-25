import React from 'react';
import moment from 'moment';

import { Dropdown, InputWrapper, Modal, Slider, Text } from 'components/kit';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { ANALYTICS_EVENT_KEYS } from 'config/analytics/analyticsKeysMap';
import { DATE_EXPORTING_FORMAT } from 'config/dates/dates';

import * as analytics from 'services/analytics';

import { downloadLink, getSVGString, imgSource2Image } from 'utils/helper';

import { FORMAT_ENUM, PREVIEW_BOUNDS, PREVIEW_MODAL_DIMENSION } from './config';

import { IExportPreviewProps } from '.';

import './ExportPreview.scss';

function ExportPreview({
  openModal,
  onToggleExportPreview,
  withDynamicDimensions = false,
  explorerPage = 'metrics',
  children,
  appendElement = null,
}: IExportPreviewProps): React.FunctionComponentElement<React.ReactNode> {
  const gridRef = React.useRef<HTMLDivElement>(null);
  const previewRef = React.useRef<HTMLDivElement>(null);
  const appendElRef = React.useRef<HTMLDivElement>(null);

  const [processing, setProcessing] = React.useState<boolean>(false);
  const [openFormatDropdown, setOpenFormatDropdown] =
    React.useState<boolean>(false);
  const [previewDimension, setPreviewDimension] = React.useState(
    PREVIEW_MODAL_DIMENSION,
  );
  const [format, setFormat] = React.useState<FORMAT_ENUM>(FORMAT_ENUM.SVG);
  const [fileName, setFileName] = React.useState<string>(
    `${explorerPage}-${moment().format(DATE_EXPORTING_FORMAT)}`,
  );
  const [isImageWidthValid, setIsImageWidthValid] =
    React.useState<boolean>(false);
  const [isImageHeightValid, setIsImageHeightValid] =
    React.useState<boolean>(false);

  const clearChart = React.useCallback(
    (svgElement: SVGSVGElement): SVGSVGElement => {
      // remove hover attributes from chart
      const attributes = svgElement.querySelector('.Attributes');
      if (attributes) {
        attributes.remove?.();
      }
      return svgElement;
    },
    [],
  );

  const appendVizNodes = React.useCallback(
    (
      wrapper: SVGSVGElement,
      chartGrid: HTMLElement,
      imgFormat: FORMAT_ENUM,
    ) => {
      const svgVizNodes = chartGrid.querySelectorAll('svg.Visualization');
      const gridColumns = Math.round(
        chartGrid.scrollWidth / svgVizNodes[0].clientWidth,
      );
      let gridRows = 0;
      svgVizNodes?.forEach((svgVizNode, index) => {
        if (index !== 0 && index % gridColumns === 0) {
          gridRows++;
        }
        const clearedSvgElement = clearChart(
          svgVizNode.cloneNode(true) as SVGSVGElement,
        );
        const columnIndex = index % gridColumns;
        clearedSvgElement.setAttribute(
          'x',
          columnIndex * svgVizNode.clientWidth + 'px',
        );
        if (gridRows) {
          clearedSvgElement.setAttribute(
            'y',
            gridRows * svgVizNode.clientHeight + 'px',
          );
        }
        const rect = clearedSvgElement.querySelector('rect');
        if (rect && imgFormat !== FORMAT_ENUM.PNG) {
          clearedSvgElement.style.backgroundColor = 'white';
          clearedSvgElement.style.fill = 'white';
          rect.style.fill = 'white';
        }
        wrapper.appendChild(clearedSvgElement);
      });
    },
    [clearChart],
  );

  const appendLegends = React.useCallback(
    (
      wrapper: SVGSVGElement,
      chartLegends: HTMLElement | null,
      gridWidth: number,
      gridHeight: number,
      format: FORMAT_ENUM,
    ) => {
      const svgLegendNode = chartLegends?.querySelector('svg.Legends');
      if (chartLegends && svgLegendNode) {
        const { scrollWidth: legendsWidth, scrollHeight: legendsHeight } =
          svgLegendNode;
        const clonedSVGNode = svgLegendNode.cloneNode(true) as SVGSVGElement;
        clonedSVGNode.setAttribute('x', gridWidth + 'px');
        clonedSVGNode.setAttribute('y', '0px');

        const width = gridWidth + legendsWidth;
        const height = legendsHeight > gridHeight ? legendsHeight : gridHeight;

        wrapper.setAttribute('width', width + 'px');
        wrapper.setAttribute('height', height + 'px');
        wrapper.setAttribute('viewBox', `0 0 ${width} ${height}`);

        if (format !== FORMAT_ENUM.PNG) {
          clonedSVGNode.style.backgroundColor = 'white';
          clonedSVGNode.style.fill = 'white';
        }
        wrapper.appendChild(clonedSVGNode);
        return { width, height };
      }
      return { width: gridWidth, height: gridHeight };
    },
    [],
  );

  const createSVGWrapper = React.useCallback(
    (width: number, height: number, format: FORMAT_ENUM): SVGSVGElement => {
      const nameSpace = 'http://www.w3.org/2000/svg';
      let wrapper: SVGSVGElement = document.createElementNS(nameSpace, 'svg');
      wrapper.setAttribute('width', `${width}px`);
      wrapper.setAttribute('height', `${height}px`);
      wrapper.setAttribute('viewBox', `0 0 ${width} ${height}`);
      wrapper.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      if (format !== FORMAT_ENUM.PNG) {
        wrapper.style.backgroundColor = 'white';
        wrapper.style.fill = 'white';
      }
      return wrapper;
    },
    [],
  );

  const getExportFunc = React.useCallback(
    (
      svgWrapper: SVGSVGElement,
      fileName: string,
      width: number,
      height: number,
    ) => {
      const svgString = getSVGString(svgWrapper);
      const imgSrc =
        'data:image/svg+xml;base64,' +
        btoa(unescape(encodeURIComponent(svgString))); // Convert SVG string to data URL

      const imgSrcExportDict = {
        [FORMAT_ENUM.SVG]: () => downloadLink(imgSrc, fileName || 'name'),
        [FORMAT_ENUM.PNG]: () =>
          imgSource2Image({
            imgSrc,
            width,
            height,
            format: FORMAT_ENUM.PNG,
            callback: (blob) => {
              const src = URL.createObjectURL(blob);
              downloadLink(src, fileName || 'name');
            },
          }),
        [FORMAT_ENUM.JPEG]: () =>
          imgSource2Image({
            imgSrc,
            width,
            height,
            format: FORMAT_ENUM.JPEG,
            callback: (blob) => {
              const src = URL.createObjectURL(blob);
              downloadLink(src, fileName || 'name');
            },
          }),
      };

      return imgSrcExportDict;
    },
    [],
  );

  const onExportImage = React.useCallback((): void => {
    setProcessing(true);
    try {
      const chartGrid = gridRef.current;
      if (chartGrid) {
        const { scrollWidth: gridWidth, scrollHeight: gridHeight } = chartGrid;

        const svgWrapper = createSVGWrapper(gridWidth, gridHeight, format);
        appendVizNodes(svgWrapper, chartGrid, format);

        const chartLegends = appendElRef.current;

        const { width: imgWidth, height: imgHeight } = appendLegends(
          svgWrapper,
          chartLegends,
          gridWidth,
          gridHeight,
          format,
        );

        const exportFunc = getExportFunc(
          svgWrapper,
          fileName,
          imgWidth,
          imgHeight,
        )[format];

        if (typeof exportFunc === 'function') {
          exportFunc();
        }

        analytics.trackEvent(
          ANALYTICS_EVENT_KEYS[explorerPage].chart.controls.exportChart,
        );
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    } finally {
      setProcessing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [format, createSVGWrapper, fileName, appendLegends, appendVizNodes]);

  const formatOptions = React.useMemo(
    () =>
      Object.entries(FORMAT_ENUM).map(([label, value]) => ({
        value,
        label,
      })),
    [],
  );

  const updateChart = React.useCallback(
    (dimensions: { height?: number; width?: number }) => {
      if (previewRef.current) {
        if (dimensions.hasOwnProperty('height')) {
          previewRef.current.style.height = `${dimensions['height']}px`;
          previewRef.current.style.minHeight = `${dimensions['height']}px`;
        }
        if (dimensions.hasOwnProperty('width')) {
          previewRef.current.style.width = `${dimensions['width']}px`;
          previewRef.current.style.minWidth = `${dimensions['width']}px`;
        }
      }
    },
    [],
  );

  const onDimensionChange = React.useCallback(
    (key: string, newValue: number, metadata: any = { isValid: true }) => {
      if (metadata.isValid) {
        updateChart({ [key]: newValue });
      }
      setPreviewDimension((prev) => ({
        ...prev,
        [key]: newValue,
      }));
    },
    [updateChart],
  );

  const validationPatterns = React.useCallback(
    (min: number, max: number) => [
      {
        errorCondition: (value: number) => value < min,
        errorText: `Value should be equal or greater then ${min}`,
      },
      {
        errorCondition: (value: number) => value > max,
        errorText: `Value should be equal or smaller then ${max}`,
      },
    ],
    [],
  );

  return (
    <ErrorBoundary>
      <Modal
        open={openModal}
        className='ExportPreview'
        title='Chart Exporting Preview'
        withoutTitleIcon
        maxWidth={false}
        okButtonText='Download'
        isOkButtonDisabled={
          processing || !(isImageWidthValid && isImageHeightValid)
        }
        onClose={onToggleExportPreview}
        onOk={onExportImage}
        classes={{ paper: 'ExportPreview__modal' }}
      >
        <div className='ExportPreview__container'>
          <div ref={previewRef} style={PREVIEW_MODAL_DIMENSION}>
            <div ref={gridRef} className='ExportPreview__container__grid'>
              {children}
            </div>
          </div>
          {!!appendElement && (
            <div
              ref={appendElRef}
              className='ExportPreview__container__appendElement'
            >
              {appendElement}
            </div>
          )}
        </div>
        <div className='ExportPreview__controls'>
          {withDynamicDimensions && (
            <div className='ExportPreview__controls__dimension'>
              <div className='ExportPreview__controls__dimension__width'>
                <Text size={14}>Chart Width</Text>
                <Slider
                  aria-label='Width'
                  valueLabelDisplay='auto'
                  containerClassName='ExportPreview__controls__dimension__width__slider'
                  min={PREVIEW_BOUNDS.min.width}
                  max={PREVIEW_BOUNDS.max.width}
                  step={2}
                  value={previewDimension.width}
                  onChange={(
                    e: React.ChangeEvent<{}>,
                    v: number | number[],
                  ) => {
                    onDimensionChange('width', v as number);
                  }}
                />
                <InputWrapper
                  key='image-width'
                  value={`${previewDimension.width}`}
                  type='number'
                  inputProps={{ step: 2 }}
                  isValidateInitially
                  showMessageByTooltip
                  tooltipPlacement='bottom'
                  onChange={(e, value, metadata) => {
                    onDimensionChange('width', value, metadata);
                    setIsImageWidthValid(metadata.isValid);
                  }}
                  validationPatterns={validationPatterns(
                    PREVIEW_BOUNDS.min.width,
                    PREVIEW_BOUNDS.max.width,
                  )}
                />
              </div>
              <div className='ExportPreview__controls__dimension__height'>
                <Text size={14}>Single Chart Height</Text>
                <Slider
                  aria-label='Height'
                  valueLabelDisplay='auto'
                  containerClassName='ExportPreview__controls__dimension__height__slider'
                  min={PREVIEW_BOUNDS.min.height}
                  max={PREVIEW_BOUNDS.max.height}
                  step={2}
                  value={previewDimension.height}
                  onChange={(
                    e: React.ChangeEvent<{}>,
                    v: number | number[],
                  ) => {
                    onDimensionChange('height', v as number);
                  }}
                />
                <InputWrapper
                  key='single-chart-height'
                  value={`${previewDimension.height}`}
                  type='number'
                  inputProps={{ step: 2 }}
                  isValidateInitially
                  showMessageByTooltip
                  tooltipPlacement='bottom'
                  onChange={(e, value, metadata) => {
                    onDimensionChange('height', value, metadata);
                    setIsImageHeightValid(metadata.isValid);
                  }}
                  validationPatterns={validationPatterns(
                    PREVIEW_BOUNDS.min.height,
                    PREVIEW_BOUNDS.max.height,
                  )}
                />
              </div>
            </div>
          )}
          <div className='ExportPreview__controls__additional'>
            <InputWrapper
              label='Image Name'
              labelAppearance='swap'
              wrapperClassName='ExportPreview__controls__additional__nameInput'
              placeholder='name'
              value={fileName}
              onChange={(e, value) => {
                setFileName(value);
              }}
            />
            <Dropdown
              className='ExportPreview__controls__additional__formatDropdown'
              isColored
              label='Format'
              withPortal
              onChange={(val) => val && setFormat(val.value as FORMAT_ENUM)}
              value={format}
              options={formatOptions}
              onMenuOpen={() => setOpenFormatDropdown(true)}
              onMenuClose={() => setOpenFormatDropdown(false)}
              open={openFormatDropdown}
            />
          </div>
        </div>
      </Modal>
    </ErrorBoundary>
  );
}

ExportPreview.displayName = 'ExportPreview';

export default React.memo<IExportPreviewProps>(ExportPreview);
