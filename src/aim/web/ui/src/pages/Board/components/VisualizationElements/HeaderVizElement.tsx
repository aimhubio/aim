import * as React from 'react';

import { Text } from 'components/kit_v2';

function HeaderVizElement({
  data,
}: {
  data: string;
}): React.FunctionComponentElement<React.ReactNode> {
  return (
    <Text as='h2' size='$9'>
      {data}
    </Text>
  );
}
export default HeaderVizElement;
