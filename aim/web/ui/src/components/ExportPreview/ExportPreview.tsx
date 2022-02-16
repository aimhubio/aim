import React from 'react';
import moment from 'moment';

import { Grid } from '@material-ui/core';

import { Dropdown, InputWrapper, Modal, Slider, Text } from 'components/kit';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { ANALYTICS_EVENT_KEYS } from 'config/analytics/analyticsKeysMap';

import * as analytics from 'services/analytics';

import { downloadLink, getSVGString, imgSource2Image } from 'utils/helper';

import { FormatEnum, previewBounds, previewModalDimension } from './config';
import { IExportPreviewProps } from './ExportPreview.d';

import './ExportPreview.scss';

function ExportPreview({
  openModal,
  onToggleExportPreview,
  withDynamicDimensions = false,
  explorerPage = 'metrics',
  children,
}: IExportPreviewProps): React.FunctionComponentElement<React.ReactNode> {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const previewRef = React.useRef<HTMLDivElement>(null);
  const [processing, setProcessing] = React.useState<boolean>(false);
  const [openFormatDropdown, setOpenFormatDropdown] =
    React.useState<boolean>(false);
  const [previewDimension, setPreviewDimension] = React.useState(
    previewModalDimension,
  );
  const [format, setFormat] = React.useState<FormatEnum>(FormatEnum.SVG);
  const [fileName, setFileName] = React.useState<string>(
    `${explorerPage}-${moment().format('HH_mm_ss-D-MMM-YY')}`,
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

  const getSVGWrapper = React.useCallback(
    (chartPanel: HTMLElement): SVGSVGElement => {
      const { scrollWidth: panelWidth, scrollHeight: panelHeight } = chartPanel;
      const nameSpace = 'http://www.w3.org/2000/svg';
      let wrapper: SVGSVGElement = document.createElementNS(nameSpace, 'svg');
      wrapper.setAttribute('width', `${panelWidth}px`);
      wrapper.setAttribute('height', `${panelHeight}px`);
      wrapper.setAttribute('viewBox', `0 0 ${panelWidth} ${panelHeight}`);
      wrapper.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      if (format !== FormatEnum.PNG) {
        wrapper.style.backgroundColor = 'white';
        wrapper.style.fill = 'white';
      }
      const svgElements = chartPanel.querySelectorAll('svg');
      const gridColumns = Math.floor(
        panelWidth / svgElements[0].getBBox().width,
      );
      let gridRows = 0;
      svgElements?.forEach((svgElement, index) => {
        if (index !== 0 && index % gridColumns === 0) {
          gridRows++;
        }
        const clearedSvgElement = clearChart(
          svgElement.cloneNode(true) as SVGSVGElement,
        );
        const columnIndex = index % gridColumns;
        clearedSvgElement.setAttribute(
          'x',
          columnIndex * svgElement.clientWidth + 'px',
        );
        if (gridRows) {
          clearedSvgElement.setAttribute(
            'y',
            gridRows * svgElement.clientHeight + 'px',
          );
        }
        const rect = clearedSvgElement.querySelector('rect');
        if (rect && format !== FormatEnum.PNG) {
          clearedSvgElement.style.backgroundColor = 'white';
          clearedSvgElement.style.fill = 'white';
          rect.style.fill = 'white';
        }
        wrapper.appendChild(clearedSvgElement);
      });
      return wrapper;
    },
    [clearChart, format],
  );

  const onExportImage = React.useCallback((): void => {
    const chartPanel = containerRef.current;
    if (chartPanel) {
      setProcessing(true);
      const svgWrapper = getSVGWrapper(chartPanel);
      try {
        const svgString = getSVGString(svgWrapper);
        const imgSrc =
          'data:image/svg+xml;base64,' +
          btoa(unescape(encodeURIComponent(svgString))); // Convert SVG string to data URL
        switch (format) {
          case FormatEnum.SVG:
            downloadLink(imgSrc, fileName || 'name');
            break;
          default:
            imgSource2Image({
              imgSrc,
              width: chartPanel.scrollWidth,
              height: chartPanel.scrollHeight,
              format,
              callback: (blob) => {
                const src = URL.createObjectURL(blob);
                downloadLink(src, fileName || 'name');
              },
            });
        }
        analytics.trackEvent(
          ANALYTICS_EVENT_KEYS[explorerPage].chart.controls.exportChart,
        );
      } catch (err) {
        console.error(err);
      } finally {
        setProcessing(false);
      }
    }
  }, [format, getSVGWrapper, fileName]);

  const formatOptions = React.useMemo(
    () =>
      Object.entries(FormatEnum).map(([label, value]) => ({
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
        }
        if (dimensions.hasOwnProperty('width')) {
          previewRef.current.style.width = `${dimensions['width']}px`;
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
        <div className='ExportPreview__container' style={previewModalDimension}>
          <div ref={previewRef} style={previewModalDimension}>
            <Grid
              ref={containerRef}
              container
              className='ExportPreview__container__grid'
            >
              {children}
            </Grid>
          </div>
        </div>
        <div className='ExportPreview__controls'>
          {withDynamicDimensions && (
            <div className='ExportPreview__controls__dimension'>
              <div className='ExportPreview__controls__dimension__width'>
                <Text size={14}>Image Width</Text>
                <Slider
                  aria-label='Width'
                  valueLabelDisplay='auto'
                  containerClassName='ExportPreview__controls__dimension__width__slider'
                  min={previewBounds.min.width}
                  max={previewBounds.max.width}
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
                    previewBounds.min.width,
                    previewBounds.max.width,
                  )}
                />
              </div>
              <div className='ExportPreview__controls__dimension__height'>
                <Text size={14}>Single Chart Height</Text>
                <Slider
                  aria-label='Height'
                  valueLabelDisplay='auto'
                  containerClassName='ExportPreview__controls__dimension__height__slider'
                  min={previewBounds.min.height}
                  max={previewBounds.max.height}
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
                    previewBounds.min.height,
                    previewBounds.max.height,
                  )}
                />
              </div>
            </div>
          )}
          <InputWrapper
            label='Image Name'
            labelAppearance='swap'
            wrapperClassName='ExportPreview__controls__nameInput'
            placeholder='name'
            value={fileName}
            onChange={(e, value) => {
              setFileName(value);
            }}
          />
          <Dropdown
            className='ExportPreview__controls__formatDropdown'
            isColored
            label='Format'
            withPortal
            onChange={(val) => val && setFormat(val.value as FormatEnum)}
            value={format}
            options={formatOptions}
            onMenuOpen={() => setOpenFormatDropdown(true)}
            onMenuClose={() => setOpenFormatDropdown(false)}
            open={openFormatDropdown}
          />
        </div>
      </Modal>
    </ErrorBoundary>
  );
}

ExportPreview.displayName = 'ExportPreview';

export default React.memo<IExportPreviewProps>(ExportPreview);
