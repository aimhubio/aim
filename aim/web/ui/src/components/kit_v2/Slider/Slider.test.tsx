import { render } from '@testing-library/react';

import Slider from './Slider';

global.ResizeObserver = require('resize-observer-polyfill');

// Test of Slider component
describe('<Slider />', () => {
  test('Renders Correctly', () => {
    const { asFragment } = render(<Slider />);
    expect(asFragment()).toMatchSnapshot();
  });

  // test of change the value props
  test('Change the value props', () => {
    const { asFragment, rerender } = render(<Slider />);
    expect(asFragment()).toMatchSnapshot();
    rerender(<Slider value={[10]} />);
    expect(asFragment()).toMatchSnapshot();
  });

  // test of change the defaultValue props
  test('Change the defaultValue props', () => {
    const { asFragment, rerender } = render(<Slider />);
    expect(asFragment()).toMatchSnapshot();
    rerender(<Slider defaultValue={[10]} />);
    expect(asFragment()).toMatchSnapshot();
  });

  // test of change the min and max props
  test('Change the min and max props', () => {
    const { asFragment, rerender } = render(<Slider />);
    expect(asFragment()).toMatchSnapshot();
    rerender(<Slider min={0} max={100} />);
    expect(asFragment()).toMatchSnapshot();
  });

  // test of render the marks props
  test('Render the marks props', () => {
    const { asFragment, rerender } = render(<Slider />);
    expect(asFragment()).toMatchSnapshot();
    rerender(
      <Slider
        marks={[
          {
            value: 0,
          },
          {
            value: 25,
          },
          {
            value: 50,
            label: '50',
          },
        ]}
      />,
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
