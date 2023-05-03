import RouteLeavingGuard from 'components/RouteLeavingGuard';

import useBoardStore from '../BoardSore';

function BoardLeavingGuard(props: any) {
  const editorValue = useBoardStore((state) => state.editorValue);
  return <RouteLeavingGuard when={props.data !== editorValue} />;
}

export default BoardLeavingGuard;
