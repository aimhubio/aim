import * as React from 'react';

import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@material-ui/core';

import { Button } from 'components/kit';

function SaveBoard(props: any) {
  let [opened, setOpened] = React.useState(false);
  const [state, setState] = React.useState(props.initialState);
  const [hasError, setHasError] = React.useState(false);
  const [isTouched, setIsTouched] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);

  async function onSubmit() {
    if (state.name) {
      setIsProcessing(true);
      await props.saveBoard({
        ...state,
        code: props.getEditorValue(),
      });
      setIsProcessing(false);
      setHasError(false);
      setState(props.initialState);
      setOpened(false);
    } else {
      setHasError(true);
      setIsTouched(true);
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const { id, value } = e.target;
    const newState: any = { ...state };
    newState[id] = value;
    setState(newState);
    if (id === 'name') {
      !isTouched && setIsTouched(true);
      setHasError(!value);
    }
  }

  function handleClose() {
    setOpened(false);
    setHasError(false);
    setIsTouched(false);
    setState(props.initialState);
  }
  return (
    <>
      <Button
        size='small'
        onClick={() => setOpened(true)}
        color='primary'
        variant='contained'
      >
        Save
      </Button>
      {opened && (
        <Dialog
          open={opened}
          onClose={handleClose}
          aria-labelledby='form-dialog-title'
        >
          <DialogTitle id='form-dialog-title'>Save Board</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              id='name'
              value={state.name}
              label='Board Name'
              onChange={handleInputChange}
              type='text'
              variant='outlined'
              margin='dense'
              fullWidth
              error={isTouched && hasError}
              helperText={isTouched && hasError ? 'Name is required' : ''}
            />
            <TextField
              id='description'
              value={state.description}
              onChange={handleInputChange}
              label='Board Description'
              type='text'
              variant='outlined'
              margin='dense'
              fullWidth
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color='primary'>
              Cancel
            </Button>
            <Button onClick={onSubmit} color='primary' disabled={isProcessing}>
              Save
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
}

export default SaveBoard;
