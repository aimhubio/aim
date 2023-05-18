import { Table } from 'components/kit_v2';

function TableVizElement(props: any) {
  return <Table {...props.options} data={props.data} />;
}

export default TableVizElement;
