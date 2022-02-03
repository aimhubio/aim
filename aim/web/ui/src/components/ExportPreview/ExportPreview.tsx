import React from 'react';

import { Grid } from '@material-ui/core';

import { InputWrapper, Modal, Slider, Text } from 'components/kit';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { previewBounds, defaultPreviewBounds } from './config';
import { IExportPreviewProps } from './ExportPreview.d';

import './ExportPreview.scss';

function ExportPreview({
  openModal,
  onToggleExportPreview,
  withDynamicDimensions,
  children,
}: IExportPreviewProps): React.FunctionComponentElement<React.ReactNode> {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const previewRef = React.useRef<HTMLDivElement>();
  const previewPrevRef = React.useRef(defaultPreviewBounds);

  const [previewDimensions, setPreviewDimensions] = React.useState({
    ...defaultPreviewBounds,
  });

  const [imageExport, setImageToExport] = React.useState<null | SVGSVGElement>(
    null,
  );

  const [isImageSizeValid, setIsImageSizeValid] =
    React.useState<boolean>(false);

  const [isImageWidthValid, setIsImageWidthValid] =
    React.useState<boolean>(false);

  const [isImageHeightValid, setIsImageHeightValid] =
    React.useState<boolean>(false);

  React.useEffect(() => {
    setIsImageSizeValid(isImageWidthValid && isImageHeightValid);
  }, [isImageWidthValid, isImageHeightValid]);

  function onDownload(): void {}

  function updateChart(dimensions: { height?: number; width?: number }) {
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
  }

  const onDimensionChange = (
    key: string,
    newValue: number,
    metadata: any = { isValid: true },
  ) => {
    if (metadata.isValid) {
      updateChart({ [key]: newValue });
    }
    setPreviewDimensions((prev) => ({
      ...prev,
      [key]: newValue,
    }));
  };

  function clearImage(svgElement: SVGSVGElement) {
    const attributes = svgElement.querySelector('.Attributes');
    // remove hover attributes from chart
    if (attributes) {
      attributes.remove?.();
    }
    return svgElement;
  }

  function loadImg() {
    const panel = containerRef.current;
    debugger;
    if (panel) {
      // setProcessing(true);
      const svgElements = panel.querySelectorAll('svg');
      const wrapper = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'svg',
      );

      const firstSvg = svgElements[0];
      debugger;
      const bbox = firstSvg.getBBox();
      const svgWidth = Math.round(bbox.width);
      const svgHeight = Math.round(bbox.height);
      const gridSize = Math.round(panel.scrollWidth / svgWidth);
      let row = 0;

      console.log(gridSize);
      svgElements?.forEach((svgElement, index) => {
        if (index !== 0 && index % gridSize === 0) {
          row++;
        }
        const clearedSvgElement = clearImage(
          svgElement.cloneNode(true) as SVGSVGElement,
        );
        debugger;
        clearedSvgElement.style.border = '1px solid #e8e8e8';
        clearedSvgElement.style.background = 'transparent';
        clearedSvgElement.setAttribute(
          'x',
          (index % gridSize) * svgWidth + 10 + 'px',
        );
        if (row) {
          clearedSvgElement.setAttribute('y', row * svgHeight + 10 + 'px');
        }
        wrapper.appendChild(clearedSvgElement);
      });
      const root = document.getElementById('root');
      wrapper.style.position = 'fixed';
      wrapper.style.zIndex = '10';
      wrapper.style.background = 'transparent';
      wrapper.style.width = `${panel.scrollWidth}px`;
      wrapper.style.height = `${panel.scrollHeight}px`;
      wrapper.style.top = '10px';
      wrapper.style.left = '10px';
      root?.appendChild(wrapper);
      setImageToExport(wrapper);

      // window.clearTimeout(timeOutId.current);
      // timeOutId.current = window.setTimeout(setImg);
      window.setTimeout(() => setImg(wrapper));
    }
  }

  function downloadLink(href: string, name: string) {
    let link = document.createElement('a');
    link.download = name;
    link.style.opacity = '0';
    document.body.append(link);
    link.href = href;
    link.click();
    link.remove();
  }

  async function setImg(captureNode: SVGSVGElement) {
    try {
      debugger;
      // const canvas = await html2canvas(captureNode, {
      //   removeContainer: true,
      //   width: captureNode.offsetWidth,
      //   height: captureNode.offsetHeight,
      //   backgroundColor: null,
      // });
      // console.log(captureNode.childNodes);
      const serializer = new XMLSerializer();
      const serializedString = serializer.serializeToString(captureNode);
      const imgSrc =
        'data:image/svg+xml;base64,' +
        btoa(unescape(encodeURIComponent(serializedString)));
      // svgString2Image(
      //   serializedString,
      //   captureNode.scrollWidth,
      //   captureNode.scrollHeight,
      //   'image/jpeg',
      //   (dataURL: string) => {
      //     downloadLink(dataURL, 'svg');
      //   },
      // );

      debugger;

      // const imgBase64Src = canvas.toDataURL('image/png', 1.0);
      console.log(imgSrc);

      // downloadLink(imgSrc, '123123123');
      // setExportImgCanvas(canvas);
    } catch (err) {
      console.error(err);
    } finally {
      // setProcessing(false);
    }
  }

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
        onOk={onDownload}
        classes={{ paper: 'ExportPreview__modal' }}
      >
        {withDynamicDimensions && (
          <div className='ExportPreview__dimension'>
            <div className='ExportPreview__dimension__width'>
              <Text>Width</Text>
              <Slider
                aria-label='Width'
                valueLabelDisplay='auto'
                containerClassName='ExportPreview__dimension__width__slider'
                min={previewBounds.min.width}
                max={previewBounds.max.width}
                step={2}
                value={previewDimensions.width}
                onChange={(e: React.ChangeEvent<{}>, v: number | number[]) => {
                  onDimensionChange('width', v as number);
                }}
              />
              <InputWrapper
                value={`${previewDimensions.width}`}
                type='number'
                size='small'
                inputProps={{ step: 2 }}
                isValidateInitially
                showMessageByTooltip
                tooltipPlacement='bottom'
                onChange={(e, value, metadata) => {
                  onDimensionChange('width', value, metadata);
                  setIsImageWidthValid(metadata.isValid);
                }}
                validationPatterns={[
                  {
                    errorCondition: (value: number) =>
                      value < previewBounds.min.width,
                    errorText: `Value should be equal or greater then ${previewBounds.min.width}`,
                  },
                  {
                    errorCondition: (value: number) =>
                      value > previewBounds.max.width,
                    errorText: `Value should be equal or smaller then ${previewBounds.max.width}`,
                  },
                ]}
              />
            </div>
            <div className='ExportPreview__dimension__height'>
              <Text className='ExportPreview__dimension__height__label'>
                Height
              </Text>
              <Slider
                aria-label='Height'
                valueLabelDisplay='auto'
                containerClassName='ExportPreview__dimension__height__slider'
                min={previewBounds.min.height}
                max={previewBounds.max.height}
                step={2}
                value={previewDimensions.height}
                onChange={(e: React.ChangeEvent<{}>, v: number | number[]) => {
                  onDimensionChange('height', v as number);
                }}
              />
              <InputWrapper
                value={`${previewDimensions.height}`}
                type='number'
                labelAppearance='top-labeled'
                size='small'
                inputProps={{ step: 2 }}
                isValidateInitially
                showMessageByTooltip
                tooltipPlacement='bottom'
                onChange={(e, value, metadata) => {
                  onDimensionChange('height', value, metadata);
                  setIsImageHeightValid(metadata.isValid);
                }}
                validationPatterns={[
                  {
                    errorCondition: (value: number) =>
                      value < previewBounds.min.height,
                    errorText: `Value should be equal or greater then ${previewBounds.min.height}`,
                  },
                  {
                    errorCondition: (value: number) =>
                      value > previewBounds.max.height,
                    errorText: `Value should be equal or smaller then ${previewBounds.max.height}`,
                  },
                ]}
              />
            </div>
          </div>
        )}
        <div className='ExportPreview__container'>
          <div
            /* @ts-ignore */
            ref={previewRef}
            style={defaultPreviewBounds}
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
      </Modal>
    </ErrorBoundary>
  );
}

ExportPreview.displayName = 'ExportPreview';

export default React.memo<IExportPreviewProps>(ExportPreview);
