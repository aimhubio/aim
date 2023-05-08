import * as React from 'react';

import { Link } from 'components/kit_v2';

function LinkVizElement(props: any) {
  return (
    <Link
      css={{ display: 'flex' }}
      to={props.options.to}
      target={props.options.new_tab ? '_blank' : undefined}
    >
      {props.options.text}
    </Link>
  );
}
export default LinkVizElement;
