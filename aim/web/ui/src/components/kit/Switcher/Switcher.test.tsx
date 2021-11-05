import { render, fireEvent } from '@testing-library/react';

import Switcher from './Switcher';

const mockClick = jest.fn();

describe('<Switcher /> -', () => {
  test('Renders Correctly', () => {
    const { asFragment } = render(
      <Switcher
        onChange={mockClick}
        checked
        rightLabel='right label'
        leftLabel='left label'
      />,
    );

    expect(asFragment()).toMatchSnapshot();
  });

  test('Renders width labels correctly', () => {
    const { getByText } = render(
      <Switcher
        onChange={mockClick}
        rightLabel='right label'
        leftLabel='left label'
        checked
      />,
    );

    expect(getByText('right label', { exact: true }));
    expect(getByText('left label', { exact: true }));
  });

  test('onchange event works properly', () => {
    const { getByTestId } = render(<Switcher onChange={mockClick} checked />);

    const switcher = getByTestId('switcher');

    fireEvent.click(switcher);
    expect(mockClick).toHaveBeenCalledTimes(1);
    expect(switcher.querySelector('i')).not.toHaveClass(
      'Switcher__circle__checked',
    );

    fireEvent.click(switcher);
    expect(mockClick).toHaveBeenCalledTimes(2);
    expect(switcher.querySelector('i')).toHaveClass(
      'Switcher__circle__checked',
    );
  });
});
