import React from 'react';

import { Button } from 'components/kit';

import './Box.scss';

function Box(props: any) {
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
      <div>
        <Button onClick={onClickShowInfo}>Show Info</Button>
      </div>
      {props.children}
    </div>
  );
}

export default Box;
