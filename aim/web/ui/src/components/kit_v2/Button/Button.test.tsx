import { render } from '@testing-library/react';

import Button from './Button';

// Test of Button component
describe('<Button startIcon="search">Click</Button>', () => {
  test('Renders Correctly', () => {
    const { asFragment } = render(<Button leftIcon='search'>Click</Button>);
    expect(asFragment()).toMatchSnapshot();
  });

  // test onClick event
  test('onClick event works properly', () => {
    const onClick = jest.fn();
    const { getByTestId } = render(
      <Button leftIcon='search' onClick={onClick}>
        Click
      </Button>,
    );
    const button = getByTestId('button');
    button.click();
    expect(onClick).toHaveBeenCalled();
  });
});
