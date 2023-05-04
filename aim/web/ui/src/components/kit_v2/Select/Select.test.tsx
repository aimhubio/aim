import { render } from '@testing-library/react';

import Select from './';

// Test of Select component
describe('Select component', () => {
  const options = [
    {
      group: 'Group 1',
      options: [
        { value: 'test1', label: 'Test 1' },
        { value: 'test2', label: 'Test 2' },
      ],
    },
  ];

  it('should render with options', () => {
    const { container } = render(
      <Select options={options} onValueChange={(val: string) => {}} />,
    );
    expect(container).toBeInTheDocument();
  });

  // Test of Select component multiple and searchable prop
  it('should render with multiple', () => {
    const { container } = render(
      <Select
        multiple
        searchable
        options={options}
        onValueChange={(val: string) => {}}
      />,
    );
    expect(container).toBeInTheDocument();
  });
});
