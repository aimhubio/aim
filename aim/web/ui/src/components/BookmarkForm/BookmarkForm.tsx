import React, { useState } from 'react';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@material-ui/core';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import {
  IBookmarkFormState,
  IBookmarkFormProps,
} from 'types/components/BookmarkForm/BookmarkForm';

const initialState: IBookmarkFormState = { name: '', description: '' };
function BookmarkForm({
  open,
  onClose,
  onBookmarkCreate,
}: IBookmarkFormProps): React.FunctionComponentElement<React.ReactNode> {
  const [state, setState] = useState<IBookmarkFormState>(initialState);
  const [hasError, setHasError] = useState(false);
  const [isTouched, setIsTouched] = useState(false);

  function onSubmit(): void {
    if (state.name) {
      onBookmarkCreate(state);
      setHasError(false);
      setState({ name: '', description: '' });
      onClose();
    } else {
      setHasError(true);
      setIsTouched(true);
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const { id, value } = e.target;
    const newState = { ...state };
    newState[id as keyof IBookmarkFormState] = value;
    setState(newState);
    if (id === 'name') {
      !isTouched && setIsTouched(true);
      setHasError(!value);
    }
  }

  function handleClose() {
    onClose();
    setHasError(false);
    setIsTouched(false);
    setState(initialState);
  }

  return (
    <ErrorBoundary>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby='form-dialog-title'
      >
        <DialogTitle id='form-dialog-title'>Add Bookmark</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            id='name'
            value={state.name}
            label='Bookmark Name'
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
            label='Bookmark Description'
            type='text'
            variant='outlined'
            margin='dense'
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color='primary'>
            Cancel
          </Button>
          <Button onClick={onSubmit} color='primary'>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </ErrorBoundary>
  );
}

export default BookmarkForm;
