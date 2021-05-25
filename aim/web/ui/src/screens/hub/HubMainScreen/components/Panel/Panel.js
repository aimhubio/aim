import './Panel.less';

import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

import PanelChart from './components/PanelChart/PanelChart';
import ParallelCoordinatesChart from './components/ParallelCoordinatesChart/ParallelCoordinatesChart';
import UI from '../../../../../ui';
import { HubMainScreenModel } from '../../models/HubMainScreenModel';
import PanelPopUps from './components/PopUp/PanelPopUps';

const gridSize = 12;
const templateGridCellsMaxCount = 9;
const templates = {
  // Grid size: 12x12; Cell props: [w, h]
  0: [],
  1: [[12, 12]],
  2: [
    [6, 12],
    [6, 12],
  ],
  3: [
    [6, 6],
    [6, 6],
    [12, 6],
  ],
  4: [
    [6, 6],
    [6, 6],
    [6, 6],
    [6, 6],
  ],
  5: [
    [4, 6],
    [4, 6],
    [4, 6],
    [6, 6],
    [6, 6],
  ],
  6: [
    [4, 6],
    [4, 6],
    [4, 6],
    [4, 6],
    [4, 6],
    [4, 6],
  ],
  7: [
    [4, 6],
    [4, 6],
    [4, 6],
    [3, 6],
    [3, 6],
    [3, 6],
    [3, 6],
  ],
  8: [
    [4, 4],
    [4, 4],
    [4, 4],
    [4, 4],
    [4, 4],
    [4, 4],
    [6, 4],
    [6, 4],
  ],
  9: [
    [4, 4],
    [4, 4],
    [4, 4],
    [4, 4],
    [4, 4],
    [4, 4],
    [4, 4],
    [4, 4],
    [4, 4],
  ],
};

function Panel(props) {
  let panelRef = useRef();

  let [state, setState] = useState({
    width: null,
    height: null,
  });

  let { runs, search } = HubMainScreenModel.useHubMainScreenState([
    HubMainScreenModel.events.SET_RUNS_STATE,
  ]);

  let { isExploreParamsModeEnabled, getCountOfSelectedParams } =
    HubMainScreenModel.helpers;

  useEffect(() => {
    if (props.resizing === false) {
      setSize();
    }
  }, [
    state.height,
    props.resizing,
    props.parentHeight,
    props.parentWidth,
    props.mode,
  ]);

  function setSize() {
    const height = panelRef.current.clientHeight;
    const width = panelRef.current.clientWidth;

    setState({
      height,
      width,
    });
  }

  function _renderPanelMsg(Elem) {
    return <div className='Panel__msg__wrapper'>{Elem}</div>;
  }

  function _renderCharts() {
    if (props.indices === null || props.indices.length === 0) {
      return null;
    }

    if (!props.parentHeight || state.height === null || state.width === null) {
      return null;
    }

    const widthFr = (state.width - 1) / gridSize;
    const heightFr = (state.height - 1) / gridSize;

    const indices = props.indices;

    return (
      <>
        {indices?.map((i) => (
          <div
            className='Panel__chart-wrapper'
            key={i}
            style={{
              width:
                (indices.length >= templateGridCellsMaxCount
                  ? 4
                  : templates[indices.length][i][0]) * widthFr,
              height:
                (indices.length >= templateGridCellsMaxCount
                  ? 4
                  : templates[indices.length][i][1]) * heightFr,
            }}
          >
            {runs?.meta?.params_selected ? (
              <ParallelCoordinatesChart
                index={i}
                width={
                  (indices.length >= templateGridCellsMaxCount
                    ? 4
                    : templates[indices.length][i][0]) * widthFr
                }
                height={
                  (indices.length >= templateGridCellsMaxCount
                    ? 4
                    : templates[indices.length][i][1]) * heightFr
                }
              />
            ) : (
              <PanelChart
                index={i}
                width={
                  (indices.length >= templateGridCellsMaxCount
                    ? 4
                    : templates[indices.length][i][0]) * widthFr
                }
                height={
                  (indices.length >= templateGridCellsMaxCount
                    ? 4
                    : templates[indices.length][i][1]) * heightFr
                }
              />
            )}
          </div>
        ))}
        <PanelPopUps panelWidth={state.width} panelHeight={state.height} />
      </>
    );
  }

  return (
    <div className='Panel' ref={panelRef}>
      {props.resizing ? (
        <div className='Panel__resizing'>
          <UI.Text type='primary' center>
            Release to resize
          </UI.Text>
        </div>
      ) : runs.isLoading ? (
        search.query.indexOf('tf:') === -1 ? (
          _renderPanelMsg(
            <UI.Text type='grey' center>
              Loading..
            </UI.Text>,
          )
        ) : (
          _renderPanelMsg(
            <UI.Text type='grey' center>
              Loading tf.summary logs can take some time..
            </UI.Text>,
          )
        )
      ) : (
        <>
          {runs.isEmpty === false &&
            (isExploreParamsModeEnabled() &&
            getCountOfSelectedParams() === 1 ? (
                _renderPanelMsg(
                  <UI.Text type='grey' center>
                  Please select at least two params to see parallel coordinates
                  plot displayed.
                  </UI.Text>,
                )
              ) : (
                <div className='Panel__chart-container'>{_renderCharts()}</div>
              ))}
        </>
      )}
    </div>
  );
}

Panel.defautlProps = {
  parentHeight: null,
  parentWidth: null,
  resizing: false,
  indices: null,
  mode: '',
};

Panel.propTypes = {
  parentHeight: PropTypes.number,
  parentWidth: PropTypes.number,
  resizing: PropTypes.bool,
  indices: PropTypes.array,
  mode: PropTypes.string,
};

export default React.memo(Panel);
