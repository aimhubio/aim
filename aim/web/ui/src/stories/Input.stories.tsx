import { useFormik } from 'formik';
import * as yup from 'yup';

import { ComponentStory, ComponentMeta } from '@storybook/react';
import { IconSearch } from '@tabler/icons-react';

import Input from 'components/kit_v2/Input';

export default {
  title: 'Kit/Inputs/Input',
  component: Input,
  argTypes: {
    inputSize: {
      control: 'select',
    },
  },
} as ComponentMeta<typeof Input>;

const Template: ComponentStory<typeof Input> = (args) => {
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
    <Input
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
  inputSize: 'md',
  value: 'Default Input',
  leftIcon: <IconSearch />,
};
export const Large = Template.bind({});

Large.args = {
  inputSize: 'lg',
  value: 'Large Input',
};
export const XLarge = Template.bind({});

XLarge.args = {
  inputSize: 'xl',
  value: 'xLarge Input',
};
