import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Tabs from './Tabs';
import { ITabsProps } from './Tabs.d';

const sampleTabs: ITabsProps['tabs'] = [
  {
    label: 'Tab 1',
    value: 'tab1',
    content: <div>Tab 1 Content</div>,
  },
  {
    label: 'Tab 2',
    value: 'tab2',
    content: <div>Tab 2 Content</div>,
  },
  {
    label: 'Tab 3',
    value: 'tab3',
    content: <div>Tab 3 Content</div>,
    disabled: true,
  },
];

describe('Tabs component', () => {
  it('should render Tabs with the provided tabs', () => {
    render(<Tabs tabs={sampleTabs} />);

    expect(screen.getByTestId('tab1')).toBeInTheDocument();
    expect(screen.getByTestId('tab2')).toBeInTheDocument();
    expect(screen.getByTestId('tab3')).toBeInTheDocument();
  });

  it('should display the content of the selected tab', () => {
    render(<Tabs tabs={sampleTabs} />);

    expect(screen.getByText('Tab 1 Content')).toBeInTheDocument();
    expect(screen.queryByText('Tab 2 Content')).not.toBeInTheDocument();
    expect(screen.queryByText('Tab 3 Content')).not.toBeInTheDocument();
  });

  it('should switch to the selected tab on click', () => {
    render(<Tabs tabs={sampleTabs} />);

    userEvent.click(screen.getByTestId('tab2'));

    expect(screen.queryByText('Tab 1 Content')).not.toBeInTheDocument();
    expect(screen.getByText('Tab 2 Content')).toBeInTheDocument();
    expect(screen.queryByText('Tab 3 Content')).not.toBeInTheDocument();
  });

  it('should not switch to a disabled tab on click', () => {
    render(<Tabs tabs={sampleTabs} />);

    userEvent.click(screen.getByTestId('tab3'));

    expect(screen.getByText('Tab 1 Content')).toBeInTheDocument();
    expect(screen.queryByText('Tab 2 Content')).not.toBeInTheDocument();
    expect(screen.queryByText('Tab 3 Content')).not.toBeInTheDocument();
  });
});
