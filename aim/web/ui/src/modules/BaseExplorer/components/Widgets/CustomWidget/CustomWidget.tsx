import * as React from 'react';
import _ from 'lodash-es';
import { useResizeObserver } from 'hooks';

import ResizeElement, {
  ResizableElement,
  ResizableSideEnum,
} from 'components/ResizeElement';
import ResizingFallback from 'components/ResizingFallback';

import COLORS from 'config/colors/colors';
import DASH_ARRAYS from 'config/dash-arrays/dashArrays';

import { GroupType } from 'modules/core/pipeline';

import Board from 'pages/Board/Board';

import { formatValue } from 'utils/formatValue';

import { ICustomWidgetProps } from './index';

import './CustomWidget.scss';

function CustomWidget(props: ICustomWidgetProps) {
  const {
    vizContainer,
    boxContainer,
    engine,
    engine: { useStore, pipeline },
    visualizationName,
  } = props;
  const vizEngine = engine.visualizations[visualizationName];
  const controls = vizEngine.controls;
  const customWidget = useStore(controls.customWidget.stateSelector);
  const updateCustomWidget = vizEngine.controls.customWidget.methods.update;
  const foundGroups = useStore(pipeline.foundGroupsSelector);
  const focusedState = useStore(engine.focusedState.stateSelector);

  const [initialSizes, setInitialSizes] = React.useState({
    width: 200,
    maxHeight: vizContainer.current.offsetHeight,
    maxWidth: vizContainer.current.offsetWidth,
  });

  if (focusedState.key === null) {
    (window as any).active_metric = undefined;
  } else {
    for (let groupKey in foundGroups) {
      let group = foundGroups[groupKey];
      for (let item of group.items) {
        if (focusedState.key === item.key) {
          if (focusedState.key !== (window as any).active_metric?.key) {
            (window as any).active_metric = item;
          }
        }
      }
    }
  }

  const onResizeEnd = React.useCallback(
    (resizeElement, gutterSize) => {
      if (resizeElement.current?.offsetWidth === gutterSize) {
        updateCustomWidget({ display: false });
      }
      boxContainer.current.classList.remove('ScrollBar__hidden');
    },
    [boxContainer, updateCustomWidget],
  );

  const onResizeStart = React.useCallback(() => {
    boxContainer.current.classList.add('ScrollBar__hidden');
  }, [boxContainer]);

  const resizeObserverCallback: ResizeObserverCallback = React.useCallback(
    (entries: ResizeObserverEntry[]) => {
      if (entries?.length) {
        setInitialSizes((prev) => ({
          ...prev,
          maxHeight: entries[0].contentRect.height,
          maxWidth: entries[0].contentRect.width,
        }));
      }
    },
    [],
  );

  useResizeObserver(resizeObserverCallback, vizContainer);

  return (
    <div
      className='CustomWidget'
      style={{ display: customWidget.display ? 'block' : 'none' }}
    >
      <ResizeElement
        id={`${visualizationName}-Custom-ResizeElement`}
        side={ResizableSideEnum.LEFT}
        snapOffset={80}
        useLocalStorage={true}
        initialSizes={initialSizes}
        onResizeEnd={onResizeEnd}
        onResizeStart={onResizeStart}
      >
        <ResizableElement resizingFallback={<ResizingFallback />}>
          <div className='CustomWidget__container'>
            {customWidget.code && (
              <Board
                key={focusedState.key}
                data={customWidget}
                isLoading={false}
                editMode={false}
                previewMode
              />
            )}
          </div>
        </ResizableElement>
      </ResizeElement>
    </div>
  );
}

CustomWidget.displayName = 'CustomWidget';

export default React.memo(CustomWidget);
