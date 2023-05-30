import { render } from '@testing-library/react';

import Separator from './Separator';

// Test of Separator component

describe('<Separator />', () => {
  test('Renders Correctly', () => {
    const { asFragment } = render(<Separator />);
    expect(asFragment()).toMatchSnapshot();
  });

  // test color prop
  test('color prop works properly', () => {
    const { getByTestId } = render(<Separator color='$primary100' />);
    const separator = getByTestId('separator');
    expect(separator).toHaveStyle('background-color: $primary100');
  });

  // test orientation prop
  test('orientation prop works properly', () => {
    const { getByTestId } = render(<Separator orientation='vertical' />);
    const separator = getByTestId('separator');
    expect(separator).toHaveAttribute('data-orientation', 'vertical');
  });

  // test margin prop
  test('margin prop works properly', () => {
    const { getByTestId } = render(<Separator margin='$4' />);
    const separator = getByTestId('separator');
    expect(separator).toHaveStyle('margin: "0 $4');
  });

  // test css prop
  test('css prop works properly', () => {
    const { getByTestId } = render(<Separator css={{ color: 'red' }} />);
    const separator = getByTestId('separator');
    expect(separator).toHaveStyle("color: 'red'");
  });
});
