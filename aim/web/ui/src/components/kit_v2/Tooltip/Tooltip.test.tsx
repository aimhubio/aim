import { render } from '@testing-library/react';

import Tooltip from './Tooltip';

// Test of Tooltip component
describe('<Tooltip content="Tooltip">Hover</Tooltip>', () => {
  test('Renders Correctly', () => {
    const { asFragment } = render(<Tooltip content='Tooltip'>Hover</Tooltip>);
    expect(asFragment()).toMatchSnapshot();
  });
});
