import React from 'react';

interface IFacetGroupingPopoverProps {
  items: React.ReactNodeArray;
}
function FacetGroupingPopover(props: IFacetGroupingPopoverProps) {
  const { items } = props;
  return <div>{items}</div>;
}

export default React.memo(FacetGroupingPopover);
