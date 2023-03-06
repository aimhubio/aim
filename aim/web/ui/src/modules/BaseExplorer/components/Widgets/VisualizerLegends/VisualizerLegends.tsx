import * as React from 'react';
import _ from 'lodash-es';
import { useResizeObserver } from 'hooks';

import VisualizationLegends, {
  LegendsDataType,
} from 'components/VisualizationLegends';
import ResizeElement, {
  ResizableElement,
  ResizableSideEnum,
} from 'components/ResizeElement';
import ResizingFallback from 'components/ResizingFallback';

import COLORS from 'config/colors/colors';
import DASH_ARRAYS from 'config/dash-arrays/dashArrays';

import { GroupType } from 'modules/core/pipeline';

import { formatValue } from 'utils/formatValue';

import { IVisualizerLegendsProps } from './index';

import './VisualizerLegends.scss';

function VisualizerLegends(props: IVisualizerLegendsProps) {
  const {
    vizContainer,
    boxContainer,
    engine,
    engine: { useStore, pipeline },
    visualizationName,
  } = props;
  const vizEngine = engine.visualizations[visualizationName];
  const controls = vizEngine.controls;
  const legends = useStore(controls.legends.stateSelector);
  const updateLegends = vizEngine.controls.legends.methods.update;
  const foundGroups = useStore(pipeline.foundGroupsSelector);

  const [initialSizes, setInitialSizes] = React.useState({
    width: 200,
    maxHeight: vizContainer.current.offsetHeight,
    maxWidth: vizContainer.current.offsetWidth,
  });

  const applyStyle = (groupKey: GroupType, order: number = 0) => {
    const palletIndex = 0;
    const pallet = COLORS[palletIndex];
    const styleMap: Record<string, Record<string, unknown>> = {
      [GroupType.COLOR]: { color: pallet[order % pallet.length] },
      [GroupType.STROKE]: {
        dasharray: DASH_ARRAYS[order % DASH_ARRAYS.length],
      },
    };
    return styleMap[groupKey] || {};
  };

  const legendsData: LegendsDataType = React.useMemo(() => {
    let data: LegendsDataType = {};

    for (let group of Object.values(foundGroups)) {
      const {
        type: groupName,
        fields: groupFields,
        order: groupOrder,
      } = group as {
        type: GroupType;
        fields: Record<string, unknown>;
        order: number;
      };
      if (!data[groupName]) {
        data[groupName] = {};
      }
      for (const groupFieldsEntries of Object.entries(groupFields)) {
        const [groupFieldKey, groupFieldValue] = groupFieldsEntries;
        const legendField = {
          value: formatValue(groupFieldValue, '--'),
          order: groupOrder,
          ...applyStyle(groupName, groupOrder),
        };
        if (!data[groupName][groupFieldKey]) {
          data[groupName][groupFieldKey] = [legendField];
        } else {
          data[groupName][groupFieldKey].push(legendField);
        }
      }

      for (const legendFields of Object.values(data[groupName])) {
        legendFields.sort((a, b) => (a.order || 0) - (b.order || 0));
      }
    }
    return data;
  }, [foundGroups]);

  const displayLegends: boolean = React.useMemo(
    () => !!legends?.display && !_.isEmpty(legendsData),
    [legends?.display, legendsData],
  );

  const onResizeEnd = React.useCallback(
    (resizeElement, gutterSize) => {
      if (resizeElement.current?.offsetWidth === gutterSize) {
        updateLegends({ display: false });
      }
      boxContainer.current.classList.remove('ScrollBar__hidden');
    },
    [boxContainer, updateLegends],
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

  return displayLegends ? (
    <div className='VisualizerLegends'>
      <ResizeElement
        id={`${visualizationName}-Legends-ResizeElement`}
        side={ResizableSideEnum.LEFT}
        snapOffset={80}
        useLocalStorage={true}
        initialSizes={initialSizes}
        onResizeEnd={onResizeEnd}
        onResizeStart={onResizeStart}
      >
        <ResizableElement resizingFallback={<ResizingFallback />}>
          <div className='VisualizerLegends__container'>
            <VisualizationLegends data={legendsData} mode={legends?.mode} />
          </div>
        </ResizableElement>
      </ResizeElement>
    </div>
  ) : null;
}

VisualizerLegends.displayName = 'VisualizerLegends';

export default React.memo(VisualizerLegends);
