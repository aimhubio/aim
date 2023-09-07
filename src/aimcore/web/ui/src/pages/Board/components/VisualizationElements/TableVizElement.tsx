import { Table } from 'components/kit_v2';

function TableVizElement(props: any) {
  return (
    <Table
      data={props.data}
      focusedRowIndex={props.options.focused_row_index}
      selectedIndices={props.options.selected_row_indices}
      withSelect={props.options.selectable_rows}
      onRowFocus={props.callbacks.on_row_focus}
      onRowSelect={props.callbacks.on_row_select}
    />
  );
}

export default TableVizElement;
