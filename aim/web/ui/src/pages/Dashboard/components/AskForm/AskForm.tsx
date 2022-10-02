import React from 'react';

import { TextField } from '@material-ui/core';

import { Button, Text } from 'components/kit';

import { IAskFormProps } from 'types/pages/home/components/AskForm/AskForm';

import './AskForm.scss';

function AskForm({
  onSendEmail,
}: IAskFormProps): React.FunctionComponentElement<React.ReactNode> {
  const [email, setEmail] = React.useState<string>('');

  async function handleSubmit() {
    const data = await onSendEmail({ email });
    if (data.ok) {
      setEmail('');
    }
  }

  function onChange(e: React.ChangeEvent<any>): void {
    setEmail(e.target.value);
  }

  return (
    <div className='AskForm'>
      <Text component='h2' weight={600} size={24} className='AskForm__title'>
        👋 Hey
      </Text>
      <Text component='p' size={14} weight={500} className='AskForm__p'>
        We’re working hard to create an amazing experiment tracker and need your
        feedback for the Aim. If you’d like to contribute to improving it and
        share what you like/dislike about Aim, please leave your email.
      </Text>
      <TextField
        className='TextField__OutLined__Large'
        placeholder='Write your email'
        variant='outlined'
        onChange={onChange}
        value={email}
      />
      <Button
        onClick={handleSubmit}
        variant='contained'
        className='AskForm__submit'
      >
        Submit
      </Button>
    </div>
  );
}

export default AskForm;
