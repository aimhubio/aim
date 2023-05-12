import * as React from 'react';

import { Text } from 'components/kit_v2';

function TextVizElement({ data }: { data: string }) {
  return <Text as='p'>{data}</Text>;
}
export default TextVizElement;
