import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@material-ui/core';

import {
  IBookmarkFormState,
  IBookmarkFormProps,
} from 'types/pages/metrics/components/BookmarkForm/BookmarkForm';

const initialState: IBookmarkFormState = { name: '', description: '' };
function BookmarkForm({
  open,
  onClose,
  onBookmarkCreate,
}: IBookmarkFormProps): React.FunctionComponentElement<React.ReactNode> {
  const [state, setState] = useState<IBookmarkFormState>(initialState);

  function onSubmit(): void {
    if (state.name && state.description) {
      onBookmarkCreate(state);
      setState({ name: '', description: '' });
      onClose();
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const { id, value } = e.target;
    const newState = { ...state };
    newState[id as keyof IBookmarkFormState] = value;
    setState(newState);
  }

  return (
    <Dialog open={open} onClose={onClose} aria-labelledby='form-dialog-title'>
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
  );
}

export default BookmarkForm;
