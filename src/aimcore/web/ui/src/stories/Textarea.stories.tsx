import { useFormik } from 'formik';
import * as yup from 'yup';

import { ComponentStory, ComponentMeta } from '@storybook/react';

import TextareaComponent from 'components/kit_v2/Textarea';

export default {
  title: 'Kit/Inputs/Textarea',
  component: TextareaComponent,
} as ComponentMeta<typeof TextareaComponent>;

const Template: ComponentStory<typeof TextareaComponent> = (args) => {
  const formik = useFormik({
    initialValues: { name: 'name' },
    onSubmit: () => {},
    validationSchema: yup.object({
      name: yup
        .string()
        .required('Required field')
        .max(50, 'Must be 50 characters or fewer'),
      comment: yup.string().max(100, 'Must be 100 characters or fewer'),
    }),
  });
  const { values, errors, setFieldValue } = formik;

  const { name } = values;

  function onChange(e: any) {
    const { name, value } = e.target;
    setFieldValue(name, value);
  }

  return (
    <TextareaComponent
      name='name'
      errorMessage={errors.name}
      onChange={onChange}
      value={name}
      {...args}
    />
  );
};

export const Medium = Template.bind({});

Medium.args = {
  size: 'md',
  value: 'Default Textarea',
  rows: 2,
};
export const Large = Template.bind({});

Large.args = {
  size: 'lg',
  value: 'Large Textarea',
  rows: 4,
};
export const XLarge = Template.bind({});

XLarge.args = {
  size: 'xl',
  value: 'xLarge Textarea',
  rows: 6,
};
