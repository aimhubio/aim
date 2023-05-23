import { Table } from 'components/kit_v2';

function TableVizElement(props: any) {
  return (
    <Table
      data={props.data}
      onRowFocus={props.callbacks.on_row_focus}
      onRowSelect={props.callbacks.on_row_select}
    />
  );
}

export default TableVizElement;
