import * as React from 'react';
import classNames from 'classnames';

import { drawLegends } from 'utils/d3';

import { IChartLegendsProps } from '.';

import './ChartLegends.scss';

function ChartLegends(props: IChartLegendsProps) {
  const { data, display = true, pin = false } = props;
  const legendsContainerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (legendsContainerRef.current && display) {
      drawLegends({
        legendsData: data,
        containerNode: legendsContainerRef.current,
      });
    }
  }, [data, display]);

  /*
  @TODO add pinned/sticky and display/hide versions of the legends to the controls section
      <Button
        color={legendVisibility ? 'primary' : 'default'}
        size='xSmall'
        onClick={onToggleLegendVisibility}
      >
        <Icon
          style={{ marginRight: 4 }}
          name={legendVisibility ? 'eye-show-outline' : 'eye-outline-hide'}
        />
        Legends
      </Button>
      <Tooltip title={isPinned ? 'Unpin' : 'Pin'}>
        <Button
          color={isPinned ? 'primary' : 'default'}
          size='xSmall'
          withOnlyIcon
          onClick={() => setIsPinned((state) => !state)}
        >
          <Icon name='pin' />
        </Button>
      </Tooltip>
  * */

  return (
    <div
      className={classNames('ChartLegends', {
        hide: !display,
        display,
        pin,
      })}
      onAnimationEnd={() => {
        if (legendsContainerRef.current) {
          legendsContainerRef.current.style.display = display
            ? 'block'
            : 'none';
        }
      }}
      onAnimationStart={() => {
        if (legendsContainerRef.current) {
          legendsContainerRef.current.style.display = 'block';
        }
      }}
    >
      <div ref={legendsContainerRef} className='ChartLegends__container' />
    </div>
  );
}

ChartLegends.displayName = 'ChartLegends';

export default React.memo<IChartLegendsProps>(ChartLegends);
