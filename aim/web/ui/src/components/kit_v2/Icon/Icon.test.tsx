import { IconDeviceCctvOff } from '@tabler/icons-react';
import { render } from '@testing-library/react';

import Icon from './Icon';

// Test of Button component
describe('<Icon icon={<IconDeviceCctvOff />} />', () => {
  test('Renders Correctly', () => {
    const { asFragment } = render(<Icon icon={<IconDeviceCctvOff />} />);
    expect(asFragment()).toMatchSnapshot();
  });

  // test size prop
  test('size prop works properly', () => {
    const { getByTestId } = render(
      <Icon icon={<IconDeviceCctvOff />} size='sm' />,
    );
    const icon = getByTestId('icon');
    expect(icon).toHaveStyle('width: 12px, height: 12px');
  });

  // test css prop
  test('css prop works properly', () => {
    const { getByTestId } = render(
      <Icon icon={<IconDeviceCctvOff />} css={{ color: 'red' }} />,
    );
    const icon = getByTestId('icon');
    expect(icon).toHaveStyle("color: 'red'");
  });
});
