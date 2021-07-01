import React from 'react';

export default interface IMultiSelectProps {
  value: [string | number];
  label: string | number | React.ReactNode;
  options: [string | number];
  handleChange:
    | ((
        event: React.ChangeEvent<{
          name?: string | undefined;
          value: unknown;
        }>,
        child: React.ReactNode,
      ) => void)
    | undefined;
}
