import React from 'react';

import avatarImg from 'assets/gevImg.jpeg';

import './AskForm.scss';
import { TextField } from '@material-ui/core';
import Button from 'components/Button/Button';

function AskForm(): React.FunctionComponentElement<React.ReactNode> {
  return (
    <div className='AskForm'>
      <div className='AskForm__avatar'>
        <img src={avatarImg} alt='Avatar' />
      </div>
      <h2 className='AskForm__title'>👋 Hey, I’m Gev, co-author of Aim</h2>
      <p className='AskForm__p'>
        We’re working hard to create the most amazing experiment tracker and
        need your feedback! If you’d like to contribute to improving it and
        share what you like/dislike about Aim, please leave your email and I’ll
        reach out asap
      </p>
      <TextField
        className='TextField__OutLined'
        placeholder='Write your email'
        size='small'
        variant='outlined'
      />
      <Button variant='contained'>Submit</Button>
    </div>
  );
}

export default AskForm;
