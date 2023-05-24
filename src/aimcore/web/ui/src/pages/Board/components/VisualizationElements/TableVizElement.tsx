import { Table } from 'components/kit_v2';

function TableVizElement(props: any) {
  return (
    <Table
      {...props.options}
      onRowFocus={props.callbacks.on_row_focus}
      onRowSelect={props.callbacks.on_row_select}
      data={props.data}
    />
  );
}

export default TableVizElement;
