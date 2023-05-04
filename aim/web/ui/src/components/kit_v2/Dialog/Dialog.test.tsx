import { render } from '@testing-library/react';

import Dialog from './Dialog';

// Test of Dialog component
describe('Dialog', () => {
  // Test of Dialog component
  it('should render Dialog component', () => {
    const { container } = render(<Dialog />);
    expect(container).toMatchSnapshot();
  });

  // Test of title prop
  it('should render Dialog component with title', () => {
    const { container } = render(<Dialog title='Dialog title' />);
    expect(container).toMatchSnapshot();
  });

  // Test of description prop
  it('should render Dialog component with description', () => {
    const { container } = render(<Dialog description='Dialog description' />);
    expect(container).toMatchSnapshot();
  });

  // Test of trigger prop
  it('should render Dialog component with trigger', () => {
    const { container } = render(<Dialog trigger={<button>Trigger</button>} />);
    expect(container).toMatchSnapshot();
  });

  // Test of open prop
  it('should render Dialog component with open', () => {
    const { container } = render(<Dialog open />);
    expect(container).toMatchSnapshot();
  });
});
