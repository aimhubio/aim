import { Tree } from 'components/kit_v2';

function TreeVizElement(props: any) {
  return (
    <Tree
      data={props.options.options}
      checkable
      checkedKeys={props.checkedKeys || ['0-0-0']}
      checkStrictly
      //   onValueChange={(key: string) => props.callbacks?.on_change?.(key)}
      //   {...props.options}
    />
  );
}

export default TreeVizElement;
