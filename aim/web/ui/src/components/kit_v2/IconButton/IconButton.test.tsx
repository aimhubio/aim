import { render } from '@testing-library/react';

import IconButton from './IconButton';

// Test of IconButton component
describe('<IconButton icon="search" />', () => {
  test('Renders Correctly', () => {
    const { asFragment } = render(<IconButton icon='search' />);
    expect(asFragment()).toMatchSnapshot();
  });

  // test onClick event
  test('onClick event works properly', () => {
    const onClick = jest.fn();
    const { getByTestId } = render(
      <IconButton icon='search' onClick={onClick} />,
    );
    const button = getByTestId('icon-button');
    button.click();
    expect(onClick).toHaveBeenCalled();
  });
});
