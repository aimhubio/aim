import React from 'react';

import { Button, Icon } from 'components/kit';

import BoxFullViewPopover from '../BoxFullViewPopover/BoxFullViewPopover';

import './Box.scss';

function Box(props: any) {
  const [fullView, setFullView] = React.useState<boolean>(false);
  const sequenceName = props.engine.useStore(
    (state: any) => state.sequenceName,
  );

  const boxConfig = props.engine.useStore(props.engine.boxConfig.stateSelector);

  const foundGroups = props.engine.useStore(props.engine.foundGroupsSelector);

  const groupInfo = React.useMemo(() => {
    const groupTypes = Object.keys(props.children.props.data.groups || {});
    const info: Record<string, object> = {};
    if (!foundGroups) {
      return info;
    }

    groupTypes.forEach((groupType) => {
      info[groupType] = {
        key: foundGroups[props.children.props.data.groups?.[groupType]].key,
        config: foundGroups[props.children.props.data.groups[groupType]].fields,
        items_count_in_group:
          foundGroups[props.children.props.data.groups[groupType]].items.length,
        order: foundGroups[props.children.props.data.groups[groupType]].order,
      };
    });

    return info;
  }, [foundGroups, props.children]);

  function onClickShowInfo() {
    console.group('Object info ---> ');
    console.log('group info ----> ', groupInfo);
    console.groupEnd();
  }

  return (
    <div
      className='BaseBox'
      style={{
        ...boxConfig,
        ...props.style,
      }}
    >
      <div className='fjb BaseBox__actions'>
        <Button onClick={onClickShowInfo}>Show Info</Button>
        <Button onClick={() => setFullView(true)} size='small' withOnlyIcon>
          <Icon name='zoom-in' />
        </Button>
      </div>
      {props.children}
      {fullView && (
        <BoxFullViewPopover
          onClose={() => setFullView(false)}
          groupInfo={groupInfo}
          sequence={sequenceName}
          element={props.children}
        />
      )}
    </div>
  );
}

export default Box;
