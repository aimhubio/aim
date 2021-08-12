import React, { memo, useEffect, useState } from 'react';
import COLORS from 'config/colors/colors';
import { Button, Grid, TextField } from '@material-ui/core';
import './TagForm.scss';
import API from 'services/api/api';
import tagsService from 'services/api/tags/tagsService';

function TagForm(data: any): React.FunctionComponentElement<React.ReactNode> {
  const [state, setState] = useState({ name: '', color: '' });

  useEffect(() => {
    if (data) {
      setState({ ...data });
    }
  }, []);

  function onChange(e: any) {
    setState({ ...state, [e?.target?.id]: e?.target?.value });
  }

  function onCreateButtonClick() {
    const { name, color } = state;
    //@ts-ignore
    API.post(tagsService.endpoints.CREATE_TAG, { name, color }).call();
  }
  return (
    <Grid container spacing={1} className='TagForm'>
      <form noValidate autoComplete='off'>
        <TextField
          label='Name'
          value={state.name}
          id='name'
          onChange={onChange}
        />
        <TextField
          label='Color'
          value={state.color}
          id='color'
          onChange={onChange}
        />
        <div className='TagForm__colorBox'>
          {COLORS[0].map((color) => {
            return (
              <Button
                className='TagForm__colorBox__colorButton'
                style={{ background: color }}
                key={color}
                onClick={() => {}}
              >
                {color}
              </Button>
            );
          })}
        </div>

        <Button onClick={onCreateButtonClick}>Create</Button>
        <Button onClick={() => {}}>Cancel</Button>
      </form>
    </Grid>
  );
}

export default memo(TagForm);
