/* eslint-disable react/prop-types */
/* @ts-ignore */
import React from 'react';

import Grouping from 'components/Grouping/Grouping';

import GroupingPopovers from 'config/grouping/GroupingPopovers';

// eslint-disable-next-line react/prop-types
function Modifiers({ data, onChange }) {
  const [selectOptions, setSelectOptions] = React.useState([]);

  function onSelect(d) {
    setSelectOptions(d.list);
    onChange(d.list);
  }

  function onGroupingModeChange() {}
  function onGroupingApplyChange(d) {}

  return (
    <Grouping
      groupingPopovers={GroupingPopovers.filter((g) => g.groupName === 'group')}
      groupingData={{
        group: selectOptions,
        isApplied: { group: !!selectOptions.length },
        reverseMode: { group: false },
      }}
      groupingSelectOptions={data?.map((item) => ({
        group: item.slice(0, item.indexOf('.')),
        label: item,
        value: item,
      }))}
      onGroupingSelectChange={onSelect}
      onGroupingModeChange={onGroupingModeChange}
      onGroupingPaletteChange={() => {}}
      onGroupingReset={() => {}}
      onGroupingApplyChange={onGroupingApplyChange}
      onGroupingPersistenceChange={() => {}}
      onShuffleChange={() => {}}
    />
  );
}

export default Modifiers;
