import React from 'react';

export interface IFormGroupProps {
  data: {
    sectionFields: FormGroupSectionDataType[];
  }[];
}

export type FormGroupSectionDataType = {
  content: string | number | React.ReactNode;
  control?: React.ReactNode;
  actions?: { component: React.ReactNode }[];
};
