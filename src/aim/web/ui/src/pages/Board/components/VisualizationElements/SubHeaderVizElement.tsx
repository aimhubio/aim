import * as React from 'react';

import { Text } from 'components/kit_v2';

function SubHeaderVizElement({
  data,
}: {
  data: string;
}): React.FunctionComponentElement<React.ReactNode> {
  return (
    <Text as='h3' size='$6'>
      {data}
    </Text>
  );
}
export default SubHeaderVizElement;
