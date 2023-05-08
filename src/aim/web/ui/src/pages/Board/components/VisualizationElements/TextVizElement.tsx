import { Text } from 'components/kit_v2';

function TextVizElement(props: any) {
  return <Text {...props.options}>{props.data}</Text>;
}

export default TextVizElement;
