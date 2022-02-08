import React from 'react';
import moment from 'moment';

import { Grid, Divider } from '@material-ui/core';

import { Dropdown, InputWrapper, Modal, Slider, Text } from 'components/kit';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { downloadLink, getSVGString, imgSource2Image } from 'utils/helper';

import { previewBounds, defaultPreviewBounds, FormatEnum } from './config';
import { IExportPreviewProps } from './ExportPreview.d';

import './ExportPreview.scss';

function ExportPreview({
  openModal,
  onToggleExportPreview,
  withDynamicDimensions,
  children,
}: IExportPreviewProps): React.FunctionComponentElement<React.ReactNode> {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const previewRef = React.useRef<HTMLDivElement>(null);
  const previewPrevRef = React.useRef(defaultPreviewBounds);
  const [format, setFormat] = React.useState<FormatEnum>(FormatEnum.SVG);
  const [imgName, setImgName] = React.useState<string>(
    `export-${moment().format('HH_mm_ss · D MMM, YY')}`,
  );
  const [openFormatDropdown, setOpenFormatDropdown] =
    React.useState<boolean>(false);
  const [processing, setProcessing] = React.useState<boolean>(false);
  const [previewDimensions, setPreviewDimensions] = React.useState({
    ...defaultPreviewBounds,
  });
  const [isImageSizeValid, setIsImageSizeValid] =
    React.useState<boolean>(false);
  const [isImageWidthValid, setIsImageWidthValid] =
    React.useState<boolean>(false);
  const [isImageHeightValid, setIsImageHeightValid] =
    React.useState<boolean>(false);

  React.useEffect(() => {
    setIsImageSizeValid(isImageWidthValid && isImageHeightValid);
  }, [isImageWidthValid, isImageHeightValid]);

  const updateChart = React.useCallback(
    (dimensions: { height?: number; width?: number }) => {
      if (previewPrevRef.current) {
        const { width, height } = previewPrevRef.current;

        let isWidthChanged = true;
        if (dimensions.hasOwnProperty('height')) {
          isWidthChanged = false;
        }
        if (dimensions.hasOwnProperty('width')) {
          isWidthChanged = true;
        }

        previewPrevRef.current = {
          height: !isWidthChanged ? height : height,
          width: isWidthChanged ? width + 1 : width,
        };

        if (previewRef.current) {
          previewRef.current.style.height = !isWidthChanged
            ? `${dimensions['height']}px`
            : previewRef.current.style.height;

          previewRef.current.style.width = isWidthChanged
            ? `${dimensions['width']}px`
            : previewRef.current.style.width;
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
      setPreviewDimensions((prev) => ({
        ...prev,
        [key]: newValue,
      }));
    },
    [],
  );

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
      let wrapper: SVGSVGElement = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'svg',
      );
      wrapper.setAttribute('viewBox', `0 0 ${panelWidth} ${panelHeight}`);
      wrapper.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      if (format !== FormatEnum.PNG) {
        wrapper.style.background = '#fff';
      }
      const svgElements = chartPanel.querySelectorAll('svg');
      const gridSize = Math.round(
        panelWidth / Math.round(svgElements[0].getBBox().width),
      );
      let rowIndex = 0;
      svgElements?.forEach((svgElement, index) => {
        if (index !== 0 && index % gridSize === 0) {
          rowIndex++;
        }
        const clearedSvgElement = clearChart(
          svgElement.cloneNode(true) as SVGSVGElement,
        );
        const columnIndex = index % gridSize;
        clearedSvgElement.setAttribute(
          'x',
          columnIndex * svgElement.clientWidth + 10 + 'px',
        );
        if (rowIndex) {
          clearedSvgElement.setAttribute(
            'y',
            rowIndex * svgElement.clientHeight + 10 + 'px',
          );
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
            downloadLink(imgSrc, imgName || 'name');
            break;
          default:
            imgSource2Image({
              imgSrc,
              width: chartPanel.scrollWidth,
              height: chartPanel.scrollHeight,
              format,
              callback: (src) => {
                downloadLink(src, imgName || 'name');
              },
            });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setProcessing(false);
      }
    }
  }, [format, getSVGWrapper, imgName]);

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

  const formatOptions = React.useMemo(
    () =>
      Object.entries(FormatEnum).map(([label, value]) => ({
        value,
        label,
      })),
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
        isOkButtonDisabled={!isImageSizeValid}
        onClose={onToggleExportPreview}
        onOk={onExportImage}
        classes={{ paper: 'ExportPreview__modal' }}
      >
        <div className='ExportPreview__container'>
          <div
            //  ref={previewRef}
            key={`${previewDimensions.width}-${previewDimensions.height}`}
            style={previewDimensions}
          >
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
                <Text>Width</Text>
                <Slider
                  aria-label='Width'
                  valueLabelDisplay='auto'
                  containerClassName='ExportPreview__controls__dimension__width__slider'
                  min={previewBounds.min.width}
                  max={previewBounds.max.width}
                  step={2}
                  value={previewDimensions.width}
                  onChange={(
                    e: React.ChangeEvent<{}>,
                    v: number | number[],
                  ) => {
                    onDimensionChange('width', v as number);
                  }}
                />
                <InputWrapper
                  value={`${previewDimensions.width}`}
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
                <Text>Height</Text>
                <Slider
                  aria-label='Height'
                  valueLabelDisplay='auto'
                  containerClassName='ExportPreview__controls__dimension__height__slider'
                  min={previewBounds.min.height}
                  max={previewBounds.max.height}
                  step={2}
                  value={previewDimensions.height}
                  onChange={(
                    e: React.ChangeEvent<{}>,
                    v: number | number[],
                  ) => {
                    onDimensionChange('height', v as number);
                  }}
                />
                <InputWrapper
                  value={`${previewDimensions.height}`}
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
          <Divider
            orientation='vertical'
            className='ExportPreview__controls__Divider'
          />
          <InputWrapper
            label='Image Name'
            wrapperClassName='ExportPreview__controls__nameInput'
            placeholder='name'
            value={imgName}
            onChange={(e, value) => {
              setImgName(value);
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
