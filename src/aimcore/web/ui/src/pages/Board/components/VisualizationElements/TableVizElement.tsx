import { Box, Table } from 'components/kit_v2';

function TableVizElement(props: any) {
  return (
    <Box css={{ overflow: 'auto' }}>
      <Table
        data={props.data}
        withSelect={props.options.selectable_rows}
        onRowFocus={props.callbacks.on_row_focus}
        onRowSelect={props.callbacks.on_row_select}
      />
    </Box>
  );
}

export default TableVizElement;
