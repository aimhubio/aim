import './BarReorder.less';

import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import _ from 'lodash';
import md5 from 'md5';

import * as analytics from '../../../../../services/analytics';
import UI from '../../../../../ui';
import { classNames } from '../../../../../utils';

function BarReorder({
  columns,
  columnsOrder,
  updateColumns,
  excludedFields,
  setExcludedFields,
  alwaysVisibleColumns,
  getParamsWithSameValue,
}) {
  let [searchKey, setSearchKey] = useState('');
  let [panesKey, setPanesKey] = useState('');
  let keySeed = useRef(0);

  const columnsKeys = columns.map((c) => c.key);
  const hiddenFields = excludedFields.filter((field) =>
    columnsKeys.includes(field),
  );
  const availableColumnsForHiding = columnsKeys.filter(
    (col) => !alwaysVisibleColumns.includes(col),
  );

  function resetColumnsOrder() {
    updateColumns(undefined, true);
    setPanesKey(md5(++keySeed.current));
    analytics.trackEvent('[Table] Reset table columns order');
  }

  return (
    <div className='ContextTableBar__item__wrapper'>
      <UI.Popover
        alignBy='left'
        target={
          <>
            <UI.Icon i='view_week' scale={1.2} />
            <span className='ContextTableBar__item__label__text'>
              Manage Columns
            </span>
            {!!hiddenFields?.length && (
              <UI.Text
                className='ContextTableBar__item__label__subtext'
                inline
                small
                bold
              >
                ({hiddenFields.length} hidden field
                {hiddenFields.length > 1 ? 's' : ''})
              </UI.Text>
            )}
          </>
        }
        targetClassName={(opened) =>
          classNames({
            ContextTableBar__item__label: true,
            active: opened,
          })
        }
        content={
          <>
            <div className='BarReorder__header'>
              <UI.Text overline bold>
                Manage table columns
              </UI.Text>
            </div>
            <div className='BarReorder__body'>
              <div className='BarReorder__searchPanel'>
                <div className='BarReorder__searchPanel__pane'>
                  <UI.Text small left>
                    {!!columnsOrder?.left?.length && 'Pinned to the left'}
                  </UI.Text>
                </div>
                <div className='BarReorder__searchPanel__pane'>
                  <UI.Input
                    placeholder='Search table columns..'
                    classNameWrapper='BarReorder__searchPanel__inputWrapper'
                    className='BarReorder__searchPanel__input'
                    value={searchKey}
                    onChange={({ target }) => setSearchKey(target.value)}
                  />
                </div>
                <div className='BarReorder__searchPanel__pane'>
                  <UI.Text small right>
                    {!!columnsOrder?.right?.length && 'Pinned to the right'}
                  </UI.Text>
                </div>
              </div>
              <div className='BarReorder__board'>
                <Panes
                  key={panesKey}
                  columnsOrder={columnsOrder}
                  updateColumns={updateColumns}
                  excludedFields={excludedFields}
                  setExcludedFields={setExcludedFields}
                  alwaysVisibleColumns={alwaysVisibleColumns}
                  searchKey={searchKey}
                />
              </div>
              <div className='BarReorder__footer'>
                <div className='BarReorder__actions'>
                  <UI.Button
                    className='BarReorder__action'
                    type='secondary'
                    size='tiny'
                    onClick={resetColumnsOrder}
                  >
                    Reset columns order
                  </UI.Button>
                  <UI.Button
                    className='BarReorder__action'
                    type='secondary'
                    size='tiny'
                    onClick={() => {
                      setExcludedFields(
                        getParamsWithSameValue(availableColumnsForHiding),
                      );
                      analytics.trackEvent('[Table] Show table columns diff');
                    }}
                  >
                    <UI.Tooltip tooltip='Hide params columns which have the same value'>
                      Show table diff
                    </UI.Tooltip>
                  </UI.Button>
                  <div className='BarReorder__actionSeparator' />
                  <UI.Button
                    className='BarReorder__action'
                    type='secondary'
                    size='tiny'
                    disabled={hiddenFields.length === 0}
                    onClick={() => {
                      setExcludedFields([]);
                      analytics.trackEvent('[Table] Show all table columns');
                    }}
                  >
                    Show all
                  </UI.Button>
                  <UI.Button
                    className='BarReorder__action'
                    type='secondary'
                    size='tiny'
                    disabled={
                      hiddenFields.length === availableColumnsForHiding.length
                    }
                    onClick={() => {
                      setExcludedFields(availableColumnsForHiding);
                      analytics.trackEvent('[Table] Hide all table order');
                    }}
                  >
                    Hide all
                  </UI.Button>
                </div>
              </div>
            </div>
          </>
        }
        popupClassName='ContextTableBar__item__popup BarReorder'
      />
    </div>
  );
}

/**
 * Reorders items within list.
 */

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

/**
 * Moves an item from one list to another list.
 */
const move = (source, destination, droppableSource, droppableDestination) => {
  const sourceClone = Array.from(source);
  const destClone = Array.from(destination);
  const [removed] = sourceClone.splice(droppableSource.index, 1);

  destClone.splice(droppableDestination.index, 0, removed);

  const result = {};
  result[droppableSource.droppableId] = sourceClone;
  result[droppableDestination.droppableId] = destClone;

  return result;
};

function Panes({
  columnsOrder,
  updateColumns,
  excludedFields,
  setExcludedFields,
  alwaysVisibleColumns,
  searchKey,
}) {
  const [state, setState] = useState([
    columnsOrder?.left ?? [],
    columnsOrder?.middle ?? [],
    columnsOrder?.right ?? [],
  ]);

  function toggleVisibility(field) {
    let updExcludedFields = [...excludedFields];
    if (updExcludedFields.indexOf(field) !== -1) {
      updExcludedFields = updExcludedFields.filter((i) => i !== field);
    } else {
      updExcludedFields.push(field);
    }
    updExcludedFields = _.uniq(updExcludedFields.filter((i) => !!i));
    setExcludedFields(updExcludedFields);
  }

  function onDragEnd(result) {
    const { source, destination } = result;

    // dropped outside the list
    if (!destination) {
      return;
    }
    const sInd = +source.droppableId;
    const dInd = +destination.droppableId;

    if (sInd === dInd) {
      const items = reorder(state[sInd], source.index, destination.index);
      const newState = [...state];
      newState[sInd] = items;
      setState(newState);
      updateColumns({
        left: newState[0],
        middle: newState[1],
        right: newState[2],
      });
    } else {
      const result = move(state[sInd], state[dInd], source, destination);
      const newState = [...state];
      newState[sInd] = result[sInd];
      newState[dInd] = result[dInd];

      setState(newState);
      updateColumns({
        left: newState[0],
        middle: newState[1],
        right: newState[2],
      });
    }
  }

  useEffect(() => {
    const midPane = document.querySelectorAll('.BarReorder__list')?.[1];
    if (!!midPane) {
      if (searchKey && searchKey.trim() !== '') {
        const firstHighlightedCol = midPane.querySelector(
          '.BarReorder__list__item.highlighted',
        );
        if (!!firstHighlightedCol) {
          midPane.scrollTop =
            firstHighlightedCol.offsetTop -
            firstHighlightedCol.parentNode.offsetTop -
            6;
        }
      } else {
        midPane.scrollTop = 0;
      }
    }
  }, [searchKey]);

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      {state.map((el, ind) => (
        <Droppable key={ind} droppableId={`${ind}`}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              className={classNames({
                BarReorder__list: true,
                isDraggingOver: snapshot.isDraggingOver,
              })}
              {...provided.droppableProps}
            >
              {(!el || el.length === 0) && (
                <div className='BarReorder__list__emptyMessage'>
                  <UI.Text type='grey-dark' small center>
                    Drag and drop columns here to pin to the{' '}
                    {ind === 0 && 'left'} {ind === 2 && 'right'}
                  </UI.Text>
                </div>
              )}
              {el.map((item, index) => {
                const textContent = (
                  item.startsWith('params.') ? item.substring(7) : item
                )
                  .replaceAll('-', ' ')
                  .replaceAll('{', '')
                  .replaceAll('}', '')
                  .replaceAll(':', '=');
                return (
                  <Draggable key={item} draggableId={item} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        style={provided.draggableProps.style}
                        className={classNames({
                          BarReorder__list__item: true,
                          isDragging: snapshot.isDragging,
                          highlighted:
                            ind === 1 &&
                            !!searchKey &&
                            searchKey.trim() !== '' &&
                            textContent.includes(searchKey),
                        })}
                      >
                        <div className='BarReorder__list__item__content'>
                          <div
                            className='BarReorder__list__item__content__field'
                            title={textContent}
                          >
                            {!alwaysVisibleColumns.includes(item) && (
                              <div
                                className={classNames({
                                  BarReorder__list__item__toggle: true,
                                  isHidden: excludedFields.includes(item),
                                })}
                                onClick={() => toggleVisibility(item)}
                              >
                                {excludedFields.includes(item) ? (
                                  <UI.Icon i='toggle_off' />
                                ) : (
                                  <UI.Icon i='toggle_on' />
                                )}
                              </div>
                            )}
                            <UI.Text type='grey-dark' small>
                              {textContent}
                            </UI.Text>
                          </div>
                          <div
                            className='BarReorder__list__item__dragHandler'
                            {...provided.dragHandleProps}
                          >
                            <div>
                              <UI.Icon i='reorder' />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      ))}
    </DragDropContext>
  );
}

export default BarReorder;
