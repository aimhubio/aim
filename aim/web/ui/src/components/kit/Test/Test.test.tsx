import { render } from '@testing-library/react';

import Test from './Test';

const Title1 = 'Test Title 1';
const Title2 = 'Test Title 2';

describe('<Test /> - ', () => {
  test('Renders without crashing', () => {
    const { asFragment } = render(<Test title={Title1} />);

    expect(asFragment()).toMatchSnapshot();
  });

  test('Renders right content', () => {
    const { getByText } = render(<Test title={Title2} />);

    getByText(Title2);
  });

  test('Prop change works properly', () => {
    const { getByText, rerender } = render(<Test title={Title2} />);
    getByText(Title2);
    rerender(<Test title={Title1} />);
    getByText(Title1);
  });
});
